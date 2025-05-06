import { Injectable, Logger } from "@nestjs/common";
import {
  CatalogObject,
  CreateOrderRequest,
  Customer,
  FulfillmentRecipient,
  Order,
  OrderLineItemDiscount,
} from "square";
import { Product } from "src/model/product";
import { Image } from "src/model/image";
import { Option } from "src/model/option";
import { Customer as CustomerModel } from "src/model/customer";
import { Modifier } from "src/model/modifier";
import { Category } from "src/model/models";
import { Order as OrderModel } from "src/model/order";
import { Status } from "src/model/status";
import { CouponType } from "src/entity/coupon.entity";
import { CouponDto } from "src/dto/coupon.dto";
import { serializeWithBigInt } from "src/util/utils";

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
            })
            .sort((a, b) => (a.defaultOption ? -1 : 1)),
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
        modifiers: item?.itemData.modifierListInfo
          ?.filter((mfr) => mfr.enabled)
          ?.map((modifier) => modifiersMap[modifier.modifierListId]),
      } as Product;
    });
  }

  orderToCreateOrderRequest(order: OrderModel): CreateOrderRequest {
    const recipient: FulfillmentRecipient = {
      customerId: order.customer?.id,
      displayName: order.customer?.firstName + " " + order.customer?.lastName,
      emailAddress: order.customer?.email,
      phoneNumber: order.customer?.phoneNumber,
      address: order.customer?.address
        ? {
            addressLine1: order.customer?.address?.address_line_1,
            addressLine2: order.customer?.address?.address_line_2,
            locality: order.customer?.address?.locality,
            postalCode: order.customer?.address?.postalCode,
            country: countryToIsoCode[order.customer?.address?.country],
          }
        : undefined,
    };
    const deliveryInstructions =
      order.type === OrderModel.TypeEnum.Delivery
        ? ` ${recipient.phoneNumber} ${recipient.address.addressLine1} ${recipient.address.addressLine2}`
        : undefined;
    const notes = `[${order.type}]${deliveryInstructions} ${order.notes}`;
    const fulfillment = {
      type: "PICKUP",
      pickupDetails: {
        recipient,
        pickupAt: new Date(
          Date.now() + SquareMapper.TEN_MINUTES_MS,
        ).toISOString(),
        scheduleType: "ASAP",
        note: notes,
      },
    };
    const serviceCharges =
      order.type === OrderModel.TypeEnum.Delivery
        ? {
            name: "Delivery fee",
            calculationPhase: "TOTAL_PHASE",
            amountMoney: {
              amount: BigInt(199),
              currency: "EUR",
            },
          }
        : undefined;
    return {
      order: {
        serviceCharges: serviceCharges ? [serviceCharges] : undefined,
        ticketName:
          order.customer?.firstName + " " + order.customer?.lastName?.charAt(0),
        customerId: order.customer?.id,
        locationId: order.locationId,
        discounts: order.coupon
          ? this.createDiscountObject(order.coupon)
          : undefined,
        lineItems: order.products.map((product) => ({
          quantity: product?.quantity.toString(),
          catalogObjectId: product.catalogId,
          modifiers: product?.modifiers?.map((modifier) => ({
            catalogObjectId: modifier.id,
            quantity: modifier?.quantity?.toString() || "1",
          })),
        })),

        fulfillments: [fulfillment],
      },
    } as CreateOrderRequest;
  }
  private createDiscountObject(coupon: CouponDto): OrderLineItemDiscount[] {
    return [
      {
        name: coupon.code,
        type: coupon.type,
        ...(coupon.type === CouponType.FIXED_AMOUNT ||
        coupon.type === CouponType.FREE_SHIPPING
          ? {
              amountMoney: {
                amount:
                  coupon.type === CouponType.FREE_SHIPPING
                    ? BigInt(199)
                    : BigInt(coupon.amount),
                currency: "EUR",
              },
            }
          : coupon.type === CouponType.FIXED_PERCENTAGE
            ? {
                percentage: coupon.discount.toString(),
              }
            : {}),
      },
    ];
  }

  mapCustomer(customer: Customer): CustomerModel {
    return {
      id: customer.id,
      firstName: customer.givenName,
      lastName: customer.familyName,
      email: customer.emailAddress,
      phoneNumber: customer.phoneNumber,
      address: {
        address_line_1: customer.address?.addressLine1,
        address_line_2: customer.address?.addressLine2,
        postal_code: customer.address?.postalCode,
        locality: customer.address?.locality,
        country: countryToIsoCode[customer.address?.country],
      },
    } as CustomerModel;
  }

  squareOrderToOrder(squareOrder: Order): OrderModel {
    this.logger.log(`Mapping Square order to Order model`);

    const fulfillment = squareOrder?.fulfillments?.[0];
    const fulfillmentType = fulfillment?.type;
    return {
      id: squareOrder.id,
      date: squareOrder.createdAt,
      type: this.mapFulfillmentTypeToOrderType(fulfillmentType, squareOrder),
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
              address: fulfillment.pickupDetails?.recipient?.address,
            })
          : {},
      products: squareOrder.lineItems?.map((item) => ({
        catalogId: item.catalogObjectId,
        quantity: Number(item.quantity),
        name: item.name,
        price: Number(item.basePriceMoney?.amount || 0),
        modifiers: item.modifiers?.map((mod) => ({
          id: mod.catalogObjectId,
          name: mod.name,
          quantity: Number(mod.quantity || 1),
          price: Number(mod.basePriceMoney?.amount || 0),
        })),
      })),
      status: {
        status: this.mapSquareStateToStatusEnum(
          squareOrder.state,
          this.mapFulfillmentTypeToOrderType(fulfillmentType, squareOrder),
        ),
        createdAt: squareOrder.updatedAt,
        createdAtTs: new Date(squareOrder.updatedAt).getTime(),
      },
      coupon: squareOrder.discounts?.[0]
        ? {
            code: squareOrder.discounts?.[0]?.name,
            type: squareOrder.discounts?.[0]?.type as CouponType,
            amount: Number(
              squareOrder.discounts?.[0]?.amountMoney?.amount || 0,
            ),
            discount: Number(squareOrder.discounts?.[0]?.percentage || 0),
          }
        : undefined,
    };
  }

  private mapFulfillmentTypeToOrderType(
    fulfillmentType: string,
    order: Order,
  ): OrderModel.TypeEnum {
    this.logger.log(
      `Mapping fulfillment type to order type: ${fulfillmentType}, notes: ${order.fulfillments?.[0]?.deliveryDetails?.note}`,
    );
    switch (fulfillmentType) {
      case undefined:
        return OrderModel.TypeEnum.Dinein;
      case "DELIVERY":
        return OrderModel.TypeEnum.Delivery;
      case "PICKUP":
        const isDineIn = order.fulfillments?.[0]?.pickupDetails?.note?.includes(
          OrderModel.TypeEnum.Dinein,
        );
        const isDelivery =
          order.fulfillments?.[0]?.pickupDetails?.note?.includes(
            OrderModel.TypeEnum.Delivery,
          );
        return isDineIn
          ? OrderModel.TypeEnum.Dinein
          : isDelivery
            ? OrderModel.TypeEnum.Delivery
            : OrderModel.TypeEnum.Pickup;
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

export const countryToIsoCode = {
  ES: "ES",
  España: "ES",
  Spain: "ES",
  Portugal: "PT",
  France: "FR",
  Italy: "IT",
  Germany: "DE",
};
