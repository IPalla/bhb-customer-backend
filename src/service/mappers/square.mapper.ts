import { Injectable, Logger } from "@nestjs/common";
import {
  CatalogObject,
  CreateOrderRequest,
  Customer,
  FulfillmentRecipient,
  Order,
  OrderLineItem,
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
import { ClaimRewardDto } from "src/dto/claim-reward.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class SquareMapper {
  private readonly logger = new Logger(SquareMapper.name);
  private static readonly TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  // --- PUBLIC METHODS ---

  productsFromCatalogObject(catalogObject: CatalogObject[]): Product[] {
    const items = catalogObject.filter(({ type }) => type === "ITEM");
    const categoriesMap = this.buildCategoriesMap(catalogObject);
    const imagesMap = this.buildImagesMap(catalogObject);
    const modifiersMap = this.buildModifiersMap(catalogObject);

    return items.map((item) => {
      this.logger.debug(`Processing catalog item: ${item?.itemData?.name}`);
      if (!item?.id || !item?.itemData?.variations?.[0]?.id) {
        this.logger.warn(
          `Skipping item due to missing required fields: ${item?.itemData?.name}`,
        );
      }
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
    const recipient = this.buildRecipient(order.customer);
    const deliveryInstructions =
      order.type === OrderModel.TypeEnum.Delivery
        ? ` ${recipient.phoneNumber} ${recipient.address.addressLine1} ${recipient.address.addressLine2}`
        : "";
    const notes = `[${order.type}]${deliveryInstructions} ${order.notes}`;
    const fulfillment = this.buildFulfillment(recipient, notes);
    const serviceCharges = this.buildServiceCharges(order.type);
    const couponDiscount = order.coupon
      ? this.createDiscountObject(order.coupon)
      : [];
    const rewardDiscount = order.reward
      ? this.createDiscountObjectForReward(order.reward)
      : [];
    const discounts = [...couponDiscount, ...rewardDiscount];
    const rewardLineItems = order.reward
      ? this.createRewardLineItems(order.reward, rewardDiscount[0].uid)
      : undefined;
    return {
      order: {
        serviceCharges: serviceCharges ? [serviceCharges] : undefined,
        ticketName:
          order.customer?.firstName + " " + order.customer?.lastName?.charAt(0),
        customerId: order.customer?.id,
        locationId: order.locationId,
        discounts: discounts.length > 0 ? discounts : undefined,
        lineItems: [
          ...order.products.map((product) => ({
            quantity: product?.quantity.toString(),
            catalogObjectId: product.catalogId,
            modifiers: product?.modifiers?.map((modifier) => ({
              catalogObjectId: modifier.id,
              quantity: modifier?.quantity?.toString() || "1",
            })),
          })),
          ...(rewardLineItems ?? []),
        ],
        fulfillments: [fulfillment],
      },
    } as CreateOrderRequest;
  }

  createRewardLineItems(reward: ClaimRewardDto, uid: string): OrderLineItem[] {
    return reward?.products?.map((product) => ({
      quantity: product.quantity.toString(),
      catalogObjectId: product.catalog_id,
      modifiers: product.modifiers?.map((modifier) => ({
        catalogObjectId: modifier.modifier_catalog_id,
        quantity: modifier.quantity.toString() || "1",
      })),
      appliedDiscounts: [
        {
          discountUid: uid,
        },
      ],
    })) as OrderLineItem[];
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

  squareOrderToOrder(squareOrder: Order, isFromPos?: boolean): OrderModel {
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
        price:
          Number(item.basePriceMoney?.amount || 0) -
          Number(item.totalDiscountMoney?.amount || 0),
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
          isFromPos || false,
        ),
        createdAt: squareOrder.updatedAt,
        createdAtTs: new Date(squareOrder.updatedAt).getTime(),
      },
      coupon: this.mapSquareDiscountToCoupon(squareOrder),
    };
  }

  squareOrderToReward(squareOrder: Order): ClaimRewardDto | undefined {
    const rewardDiscount = squareOrder.discounts?.find(
      (discount) => discount.scope === "LINE_ITEM",
    );
    const productsReward = squareOrder.lineItems?.filter((item) =>
      item.appliedDiscounts?.some(
        (discount) => discount.discountUid === rewardDiscount?.uid,
      ),
    );
    const products = productsReward?.map((product) => ({
      catalog_id: product.catalogObjectId,
      quantity: Number(product.quantity),
      modifiers: product.modifiers?.map((modifier) => ({
        modifier_catalog_id: modifier.catalogObjectId,
        quantity: Number(modifier.quantity || 1),
      })),
    }));
    return {
      reward_id: rewardDiscount?.uid,
      products: products,
    };
  }

  // --- PRIVATE METHODS ---

  private buildCategoriesMap(
    catalogObject: CatalogObject[],
  ): Record<string, Category> {
    return catalogObject
      .filter(({ type }) => type === "CATEGORY")
      .reduce(
        (acc, category) => {
          acc[category.id] = {
            id: category?.id,
            name: category?.categoryData.name,
          };
          return acc;
        },
        {} as Record<string, Category>,
      );
  }

  private buildImagesMap(
    catalogObject: CatalogObject[],
  ): Record<string, Image> {
    return catalogObject
      .filter(({ type }) => type === "IMAGE")
      .reduce(
        (acc, image) => {
          acc[image.id] = {
            url: image.imageData?.url,
            name: image.imageData?.name,
          };
          return acc;
        },
        {} as Record<string, Image>,
      );
  }

  private buildModifiersMap(
    catalogObject: CatalogObject[],
  ): Record<string, Modifier> {
    return catalogObject
      .filter(({ type }) => type === "MODIFIER_LIST")
      .reduce(
        (acc, modifier) => {
          acc[modifier?.id] = {
            id: modifier.id,
            name: modifier?.modifierListData?.name,
            type: Modifier.TypeEnum[modifier?.modifierListData?.modifierType],
            selection:
              Modifier?.SelectionEnum[
                modifier?.modifierListData?.selectionType
              ],
            options: modifier?.modifierListData?.modifiers
              .filter((mfr) => mfr.type === "MODIFIER")
              .map(
                (option) =>
                  ({
                    id: option?.id,
                    name: option?.modifierData?.name,
                    defaultOption: option?.modifierData?.ordinal === 1,
                    price: Number(option?.modifierData?.priceMoney?.amount),
                  }) as Option,
              )
              .sort((a, b) => (a.defaultOption ? -1 : 1)),
          };
          return acc;
        },
        {} as Record<string, Modifier>,
      );
  }

  private buildRecipient(
    customer: OrderModel["customer"],
  ): FulfillmentRecipient {
    return {
      customerId: customer?.id,
      displayName: customer?.firstName + " " + customer?.lastName,
      emailAddress: customer?.email,
      phoneNumber: customer?.phoneNumber,
      address: customer?.address
        ? {
            addressLine1: customer?.address?.address_line_1,
            addressLine2: customer?.address?.address_line_2,
            locality: customer?.address?.locality,
            postalCode: customer?.address?.postalCode,
            country: countryToIsoCode[customer?.address?.country],
          }
        : undefined,
    };
  }

  private buildFulfillment(recipient: FulfillmentRecipient, notes: string) {
    return {
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
  }

  private buildServiceCharges(orderType: OrderModel["type"]) {
    return orderType === OrderModel.TypeEnum.Delivery
      ? {
          name: "Delivery fee",
          calculationPhase: "TOTAL_PHASE",
          amountMoney: {
            amount: BigInt(199),
            currency: "EUR",
          },
        }
      : undefined;
  }

  private createDiscountObject(coupon: CouponDto): OrderLineItemDiscount[] {
    return [
      {
        name: coupon.code,
        type:
          coupon.type === CouponType.FREE_SHIPPING
            ? CouponType.FIXED_AMOUNT
            : coupon.type,
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

  private createDiscountObjectForReward(
    reward: ClaimRewardDto,
  ): OrderLineItemDiscount[] {
    return [
      {
        uid: reward.reward_id,
        name: reward.reward_name,
        type: "FIXED_PERCENTAGE",
        percentage: "100",
        scope: "LINE_ITEM",
      },
    ];
  }

  private mapSquareDiscountToCoupon(squareOrder: Order): CouponDto | undefined {
    const discount = squareOrder.discounts?.find(
      (discount) => discount.scope !== "LINE_ITEM",
    );
    if (!discount) return undefined;
    return {
      code: discount?.name,
      type: discount?.type as CouponType,
      amount: Number(discount?.amountMoney?.amount || 0),
      discount: Number(discount?.percentage || 0),
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
      case "PICKUP": {
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
      }
      default:
        return OrderModel.TypeEnum.Dinein;
    }
  }

  private mapSquareStateToStatusEnum(
    state: string,
    orderType: OrderModel.TypeEnum,
    isFromPos: boolean,
  ): Status.StatusEnum {
    if (isFromPos) {
      return Status.StatusEnum.PENDING;
    }
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
