import { Injectable, Logger } from "@nestjs/common";
import {
  CatalogObject,
  CreateOrderRequest,
  Customer,
  FulfillmentRecipient,
  Order,
} from "square";
import { Product } from "src/model/product";
import { Image } from "src/model/image";
import { Option } from "src/model/option";
import { Customer as CustomerModel } from "src/model/customer";
import { Modifier } from "src/model/modifier";
import { Category } from "src/model/models";
import { serializeWithBigInt } from "src/util/utils";
import { Order as OrderModel } from "src/model/order";
import { Status } from "src/model/status";

@Injectable()
export class SquareMapper {
  private readonly logger = new Logger(SquareMapper.name);
  private static readonly TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor() {}

  productsFromCatalogObject(catalogObject: CatalogObject[]): Product[] {
    const items = catalogObject.filter((item) => item.type === "ITEM");
    const categoriesMap: Map<string, Category> = catalogObject
      .filter((item) => item.type === "CATEGORY")
      .reduce((acc, category) => {
        const ctgry: Category = {
          id: category?.id,
          name: category?.categoryData.name,
        };
        acc[category.id] = ctgry;
        return acc;
      }, new Map());
    const imagesMap: Map<string, Image> = catalogObject
      .filter((item) => item.type === "IMAGE")
      .reduce((acc, image) => {
        const img: Image = {
          url: image.imageData?.url,
          name: image.imageData?.name,
        };
        acc[image.id] = img;
        return acc;
      }, new Map());
    const modifiersMap: Map<string, Modifier> = catalogObject
      .filter((item) => item.type === "MODIFIER_LIST")
      .reduce((acc, modifier) => {
        const mdfr: Modifier = {
          id: modifier.id,
          name: modifier?.modifierListData?.name,
          type: Modifier.TypeEnum[modifier?.modifierListData?.modifierType],
          selection:
            Modifier?.SelectionEnum[modifier?.modifierListData?.selectionType],
          options: modifier?.modifierListData?.modifiers
            .filter((mfr) => mfr.type === "MODIFIER")
            .map((option) => {
              return {
                id: option?.id,
                name: option?.modifierData?.name,
                defaultOption: option?.modifierData?.ordinal === 1,
                price: Number(option?.modifierData?.priceMoney?.amount),
              } as Option;
            }).sort((a, b) => a.defaultOption ? -1 : 1),
        };
        acc[modifier?.id] = mdfr;
        return acc;
      }, new Map());
    return items.map((item) => {
      // Log the item being processed for debugging
      this.logger.debug(`Processing catalog item: ${item?.itemData?.name}`);
      // Validate required fields
      if (!item?.id || !item?.itemData?.variations?.[0]?.id) {
        this.logger.warn(
          `Skipping item due to missing required fields: ${item?.itemData?.name}`,
        );
      }
      // Check for multiple variations which is not currently supported
      if (item?.itemData?.variations?.length > 1) {
        this.logger.warn(
          `Item has multiple variations, only using first one: ${item?.itemData?.name}`,
        );
      }
      return {
        id: item?.id,
        catalogId: item?.itemData.variations[0].id,
        name: item?.itemData.name,
        description: item?.itemData.description,
        category: categoriesMap[item?.itemData.reportingCategory?.id],
        images: item?.itemData?.imageIds?.map((imageId) => imagesMap[imageId]),
        price: Number(
          item?.itemData.variations[0].itemVariationData.priceMoney.amount,
        ),
        modifiers: item?.itemData.modifierListInfo?.map(
          (modifier) => modifiersMap[modifier.modifierListId],
        ),
      } as Product;
    });
  }

  orderToCreateOrderRequest(order: OrderModel): CreateOrderRequest {
    const recipient: FulfillmentRecipient = {
      customerId: order.customer?.id,
      displayName: order.customer?.firstName,
      emailAddress: order.customer?.email,
      phoneNumber: order.customer?.phoneNumber,
      address:
        order.type == OrderModel.TypeEnum.Delivery
          ? {
              addressLine1: order.customer?.address.street,
              locality: "Tres Cantos",
              postalCode: "28760",
              country: "ES",
            }
          : undefined,
    };
    return {
      order: {
        locationId: "LA6A066DRHSZZ",
        lineItems: order.products.map((product) => ({
          quantity: product?.quantity.toString(),
          catalogObjectId: product.catalogId,
          modifiers: product?.modifiers?.map((modifier) => ({
            catalogObjectId: modifier.id,
            quantity: modifier.quantity.toString(),
          })),
        })),

        fulfillments: [
          {
            type:
              order.type == OrderModel.TypeEnum.Delivery
                ? "DELIVERY"
                : "PICKUP",
            pickupDetails:
              order.type === OrderModel.TypeEnum.Pickup
                ? {
                    recipient,
                    pickupAt: new Date(
                      Date.now() + SquareMapper.TEN_MINUTES_MS,
                    ).toISOString(),
                    note: order.notes,
                  }
                : undefined,
            deliveryDetails:
              order.type === OrderModel.TypeEnum.Delivery
                ? {
                    recipient,
                    note: order.notes,
                    scheduleType: "ASAP",
                    deliverAt: new Date(
                      Date.now() + SquareMapper.TEN_MINUTES_MS,
                    ).toISOString(),
                  }
                : undefined,
          },
        ],
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
      address: {
        street: customer.address?.addressLine1,
        postalCode: customer.address?.postalCode,
        city: customer.address?.locality,
        country: customer.address?.country,
      },
    } as CustomerModel;
  }

  squareOrderToOrder(squareOrder: Order): OrderModel {
    this.logger.debug(
      `Mapping Square order to Order model: ${serializeWithBigInt(squareOrder)}`,
    );

    const fulfillment = squareOrder.fulfillments?.[0];
    const fulfillmentType = fulfillment?.type;
    console.log(
      serializeWithBigInt(
        squareOrder.lineItems?.map((item) => ({
          catalogId: item.catalogObjectId,
          quantity: Number(item.quantity),
          name: item.name,
          price: Number(item.basePriceMoney?.amount || 0),
          modifiers: item.modifiers?.map((mod) => ({
            id: mod.catalogObjectId,
            name: mod.name,
            quantity: Number(mod.quantity || 1),
          })),
        })),
      ),
    );
    return {
      id: squareOrder.id,
      date: squareOrder.createdAt,
      type: this.mapFulfillmentTypeToOrderType(fulfillmentType),
      amount: Number(squareOrder.totalMoney?.amount || 0),
      notes:
        fulfillment?.deliveryDetails?.note || fulfillment?.pickupDetails?.note,
      customer:
        fulfillment?.deliveryDetails?.recipient ||
        fulfillment?.pickupDetails?.recipient
          ? this.mapCustomer({
              id:
                fulfillment.deliveryDetails?.recipient?.customerId ||
                fulfillment.pickupDetails?.recipient?.customerId,
              givenName:
                fulfillment.deliveryDetails?.recipient?.displayName ||
                fulfillment.pickupDetails?.recipient?.displayName,
              emailAddress:
                fulfillment.deliveryDetails?.recipient?.emailAddress ||
                fulfillment.pickupDetails?.recipient?.emailAddress,
              phoneNumber:
                fulfillment.deliveryDetails?.recipient?.phoneNumber ||
                fulfillment.pickupDetails?.recipient?.phoneNumber,
              address: fulfillment.deliveryDetails?.recipient?.address,
            })
          : undefined,
      products: squareOrder.lineItems?.map((item) => ({
        catalogId: item.catalogObjectId,
        quantity: Number(item.quantity),
        name: item.name,
        price: Number(item.basePriceMoney?.amount || 0),
        modifiers: item.modifiers?.map((mod) => ({
          id: mod.catalogObjectId,
          name: mod.name,
          quantity: Number(mod.quantity || 1),
        })),
      })),
      status: {
        status: this.mapSquareStateToStatusEnum(
          squareOrder.state,
          this.mapFulfillmentTypeToOrderType(fulfillmentType),
        ),
        createdAt: squareOrder.updatedAt,
        createdAtTs: new Date(squareOrder.updatedAt).getTime(),
      },
    };
  }

  private mapFulfillmentTypeToOrderType(
    fulfillmentType: string,
  ): OrderModel.TypeEnum {
    switch (fulfillmentType) {
      case "DELIVERY":
        return OrderModel.TypeEnum.Delivery;
      case "PICKUP":
        return OrderModel.TypeEnum.Pickup;
      default:
        return OrderModel.TypeEnum.Dinein;
    }
  }

  private mapSquareStateToStatusEnum(
    state: string,
    orderType: OrderModel.TypeEnum,
  ): Status.StatusEnum {
    switch (state?.toUpperCase()) {
      case "OPEN":
        return Status.StatusEnum.PENDING;
      case "IN_PROGRESS":
        return Status.StatusEnum.INPROGRESS;
      case "COMPLETED":
        return orderType === OrderModel.TypeEnum.Delivery
          ? Status.StatusEnum.DELIVERED
          : Status.StatusEnum.READY;
      default:
        return Status.StatusEnum.PENDING;
    }
  }
}
