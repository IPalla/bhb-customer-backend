import { Controller, Logger, Post, Body } from '@nestjs/common';
import { DeliverectNewOrder } from '../model/deliverect/deliverect.new.order';
import { Order } from '../model/order';
import { Status } from '../model/status';
import { OrdersService } from '../service/orders.service';
import { Customer } from 'src/model/customer';
import { Operation } from 'src/model/operation';
import { DeliverectUpdateOrder } from 'src/model/deliverect/deliverect.update.order';
import * as moment from 'moment-timezone';

enum Channel {
  Web = 22,
  Glovo = 6,
  JustEat = 9,
  Uber = 7,
  Waitry = 10101,
  Deliverect = 1
}

enum ChannelLink {
  Web = '636b82ad5c7f22294fc770c7',
  WebDineIn = '646cc0a40b19e91d2ff1caaa',
}

enum PreparationTime {
  KitchenDineIn = 15,
  KitchenPickup = 15,
  KitchenDelivery = 15,
  Delivery = 15,
}

@Controller('bhb-customer-backend/integration/deliverect')
export class DelieverectWebhookController {
  private readonly logger = new Logger(DelieverectWebhookController.name);
  constructor(private readonly ordersService: OrdersService) {}

  @Post('new-order')
  async createOrder(@Body() order: DeliverectNewOrder): Promise<void> {
    this.logger.log(
      `Received new order from Deliverect: ${order?.channelOrderDisplayId}`,
    );
    const newOrder = this.fromDeliverect(order);
    await this.ordersService.storeOrder(newOrder);
  }

  @Post('update-order')
  async updateOrder(@Body() orderUpdate: DeliverectUpdateOrder): Promise<void> {
    this.logger.log(
      `Received update order from Deliverect: ${orderUpdate?.channelOrderId}. Status: ${orderUpdate?.status}`,
    );
    // statuses https://developers.deliverect.com/page/order-status
    const preparedStatus = [60, 70, 90];
    if (!preparedStatus.includes(orderUpdate.status)) {
      this.logger.log(`Ignored status from Deliverect: ${orderUpdate.status}`);
      return;
    } else {
      await this.ordersService.updateOrderStatus(
        orderUpdate?.orderId,
        Status.StatusEnum.READY,
        'Deliverect',
      );
    }
  }

  fromDeliverect(deliverectNewOrder: DeliverectNewOrder): Order {
    const response: Order = {};
    const orderId = deliverectNewOrder.channelOrderDisplayId;
    response.id = orderId;
    response.externalId = deliverectNewOrder._id;
    response.notes = this.truncateToVarchar255(deliverectNewOrder.note);
    // Set status to pending
    const status: Status = {};
    status.status = Status.StatusEnum.PENDING;
    status.createdBy = 'Deliverect';
    status.createdAtTs = Date.now();
    response.statuses = [status];
    response.status = status;
    response.date = deliverectNewOrder._created;
    response.type = this.getTypeFromDeliverectOrderType(
      deliverectNewOrder.orderType,
      deliverectNewOrder.channelLink,
      deliverectNewOrder.channel,
      deliverectNewOrder.note,
    );
    response.channel = this.getChannelFromOrder(deliverectNewOrder.channel);
    response.amount = this.getOrderAmount(deliverectNewOrder);
    response.items = deliverectNewOrder.items;
    response.scheduled =
      deliverectNewOrder.deliveryIsAsap === false &&
      response.channel === Order.ChannelEnum.JustEat;

    // Customer
    const customer: Customer = {};
    customer.address = deliverectNewOrder?.deliveryAddress?.source;
    customer.email = deliverectNewOrder?.customer?.email;
    customer.name = deliverectNewOrder?.customer?.name;
    customer.phone_number = deliverectNewOrder?.customer?.phoneNumber;
    if (deliverectNewOrder?.deliveryAddress?.coordinates?.coordinates 
          && deliverectNewOrder?.deliveryAddress?.coordinates?.coordinates.length === 2) {
      customer.addressLatitude = `${deliverectNewOrder?.deliveryAddress?.coordinates.coordinates[1]}`;
      customer.addressLongitude = `${deliverectNewOrder?.deliveryAddress?.coordinates.coordinates[0]}`;
    }
    response.customer = customer;

    const operation: Operation = {};
    operation.createdTs = Date.now();
    operation.expectedTotalOrderTs = this.getExpectedTotalOrderTs(
      response.scheduled,
      response.type,
      deliverectNewOrder.pickupTime,
      deliverectNewOrder.timezone,
    );
    operation.expectedReadyTs = this.getExpectedReadyTs(
      operation.expectedTotalOrderTs,
      response.type,
    );
    if (response.scheduled) {
      operation;
    }
    operation.expectedDeliveredTs =
      response.type === Order.TypeEnum.Delivery
        ? operation.expectedTotalOrderTs
        : null;
    response.operation = operation;
    return response;
  }

  getExpectedReadyTs(expectedTotalOrderTs: number, type: any): number {
    var expectedReadyTs = expectedTotalOrderTs;
    if (type === Order.TypeEnum.Delivery)
      return expectedReadyTs - PreparationTime.Delivery * 60 * 1000;
    return expectedReadyTs;
  }

  getExpectedTotalOrderTs(
    scheduled: boolean,
    type: Order.TypeEnum,
    expectedScheduledReadyTime?: string,
    deliverectTimeZone?: string,
  ): number {
    var expectedTotalOrder = Date.now();
    if (scheduled) {
      return moment(expectedScheduledReadyTime)
        .tz(deliverectTimeZone)
        .add(15, 'minutes')
        .toDate()
        .getTime();
    }
    if (type === Order.TypeEnum.Dinein)
      expectedTotalOrder += PreparationTime.KitchenDineIn * 60 * 1000;
    if (type === Order.TypeEnum.Pickup)
      expectedTotalOrder += PreparationTime.KitchenPickup * 60 * 1000;
    if (type === Order.TypeEnum.Delivery)
      expectedTotalOrder +=
        PreparationTime.KitchenDelivery * 60 * 1000 +
        PreparationTime.Delivery * 60 * 1000;
    return expectedTotalOrder;
  }

  getTypeFromDeliverectOrderType(
    deliverectOrderType: number,
    channelLink: string,
    channel,
    note?: string,
  ): Order.TypeEnum {
    if (
      channelLink === ChannelLink.WebDineIn ||
      note?.includes(' Entrega: Para tomar aquí') ||
      (channel === Channel.Deliverect && deliverectOrderType === 1)
    ) {
      return Order.TypeEnum.Dinein;
    }
    switch (deliverectOrderType) {
      case 1:
      case 3:
        return Order.TypeEnum.Pickup;
      case 2:
        return Order.TypeEnum.Delivery;
      default:
        return Order.TypeEnum.Unknown;
    }
  }

  getChannelFromOrder(channel: number): Order.ChannelEnum {
    switch (channel) {
      case Channel.Web:
        return Order.ChannelEnum.Web;
      case Channel.Deliverect:
        return Order.ChannelEnum.Deliverect;
      case Channel.Glovo:
        return Order.ChannelEnum.Glovo;
      case Channel.JustEat:
        return Order.ChannelEnum.JustEat;
      case Channel.Uber:
        return Order.ChannelEnum.Uber;
      case Channel.Waitry:
        return Order.ChannelEnum.Waitry;
      default:
        return Order.ChannelEnum.Unknown;
    }
  }

  getOrderAmount(deliverectNewOrder: DeliverectNewOrder): number {
    const deliveryPrice = deliverectNewOrder.deliveryCost || 0;
    const itemsPrice = deliverectNewOrder.items.reduce((accumulator, item) => {
      const itemPrice = item.price;
      const itemQuantity = item.quantity;
      const subItemsPrice = item?.subItems?.reduce(
        (subAccumulator, subItem) =>
          (subAccumulator += (subItem.price * itemQuantity)),
        0,
      );
      return (accumulator += itemPrice * itemQuantity + subItemsPrice);
    }, 0);
    return itemsPrice + deliveryPrice;
  }

  truncateToVarchar255(text): string {
    // Ensure the string is not null or undefined, if so, return an empty string
    if (!text) return '';
    const maxLength = 255;
    return (text.length <= maxLength) ? text : text.substring(0, maxLength);
  }
}
