import { Injectable, Logger } from "@nestjs/common";
import { CatalogObject, CreateOrderRequest, Customer, Fulfillment, FulfillmentRecipient } from "square";
import { Product } from "src/model/product";
import { Image } from "src/model/image";
import { Option } from "src/model/option";
import { Customer as CustomerModel } from "src/model/customer";
import { Modifier } from "src/model/modifier";
import { Category, Order } from "src/model/models";

@Injectable()
export class SquareMapper {
    private readonly logger = new Logger(SquareMapper.name);
    private static readonly TEN_MINUTES_MS = 10 * 60 * 1000;  // 10 minutes in milliseconds
    
    constructor() { }

    productsFromCatalogObject(catalogObject: CatalogObject[]): Product[] {
        const items = catalogObject.filter((item) => item.type === "ITEM");
        const categoriesMap: Map<string, Category> = catalogObject.filter(item => item.type === 'CATEGORY').reduce((acc, category) => {
            const ctgry: Category = {
                id: category?.id,
                name: category?.categoryData.name,
            };
            acc[category.id] = ctgry;
            return acc;
        }, new Map());
        const imagesMap: Map<string, Image> = catalogObject.filter(item => item.type === 'IMAGE').reduce((acc, image) => {
            const img: Image = {
                url: image.imageData?.url,
                name: image.imageData?.name,
            };
            acc[image.id] = img;
            return acc;
        }, new Map());
        const modifiersMap: Map<string, Modifier> = catalogObject.filter(item => item.type === 'MODIFIER_LIST').reduce((acc, modifier) => {
            const mdfr: Modifier = {
                id: modifier.id,
                name: modifier?.modifierData?.name,
                type: Modifier.TypeEnum[modifier?.modifierListData?.modifierType],
                selection: Modifier?.SelectionEnum[modifier?.modifierListData?.selectionType],
                options: modifier?.modifierListData?.modifiers.filter(mfr => mfr.type === 'MODIFIER').map((option) => {
                    return {
                        id: option?.id,
                        name: option?.modifierData?.name,
                        price: Number(option?.modifierData?.priceMoney?.amount)
                    } as Option;
                })
            }
            acc[modifier?.id] = mdfr;
            return acc;
        }, new Map());
        return items.map((item) => {
            // Log the item being processed for debugging
            this.logger.debug(`Processing catalog item: ${item?.itemData?.name}`);
            // Validate required fields
            if (!item?.id || !item?.itemData?.variations?.[0]?.id) {
                this.logger.warn(`Skipping item due to missing required fields: ${item?.itemData?.name}`);
            }
            // Check for multiple variations which is not currently supported
            if (item?.itemData?.variations?.length > 1) {
                this.logger.warn(`Item has multiple variations, only using first one: ${item?.itemData?.name}`);
            }
            return {
                id: item?.id,
                catalogId: item?.itemData.variations[0].id,
                name: item?.itemData.name,
                description: item?.itemData.description,
                category: categoriesMap[item?.itemData.categoryId],
                images: item?.itemData?.imageIds?.map((imageId) => imagesMap[imageId]),
                price: Number(item?.itemData.variations[0].itemVariationData.priceMoney.amount),
                modifiers: item?.itemData.modifierListInfo?.map((modifier) => modifiersMap[modifier.modifierListId]),
            } as Product;
        });
    }

    orderToCreateOrderRequest(order: Order): CreateOrderRequest {
        const recipient: FulfillmentRecipient = {
            customerId: order.customer?.id,
            displayName: order.customer?.firstName,
            emailAddress: order.customer?.email,
            phoneNumber: order.customer?.phoneNumber,
            address: order.type == Order.TypeEnum.Delivery ? order.customer?.address : undefined,
        };
        // TODO fixe delivery
        return {
            order: {
                locationId: 'LA6A066DRHSZZ',
                lineItems: order.products.map(product => ({
                    quantity: product?.quantity.toString(),
                    catalogObjectId: product.catalogId,
                    modifiers: product?.modifiers?.map(modifier => ({
                        catalogObjectId: modifier.id,
                        quantity: modifier.quantity.toString()
                    })),
                })),

            fulfillments: [{
                type: order.type == Order.TypeEnum.Delivery ? 'DELIVERY' : 'PICKUP',
                pickupDetails: order.type === Order.TypeEnum.Pickup ? 
                    {
                        recipient,
                        pickupAt: new Date(Date.now() + SquareMapper.TEN_MINUTES_MS).toISOString(),
                        note: order.notes
                    } : undefined,
                deliveryDetails: order.type === Order.TypeEnum.Delivery ? 
                    {
                        recipient,
                        note: order.notes,
                        scheduleType: 'ASAP',
                        deliverAt: new Date(Date.now() + SquareMapper.TEN_MINUTES_MS).toISOString(),
                    } : undefined,
            }],
            },
        } as CreateOrderRequest;
    }

    mapCustomer(customer: Customer): CustomerModel {
        return {
            id: customer.id,
            firstName: customer.givenName,
            lastName: customer.familyName,
            email: customer.emailAddress,
            phoneNumber: customer.phoneNumber,
            address: customer.address?.addressLine1
        } as CustomerModel;
    }
}