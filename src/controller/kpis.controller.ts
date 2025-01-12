import { Controller, Get, Query, Logger } from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { Order } from '../model/order';
import { Kpis } from 'src/model/kpis';
import { Status } from 'src/model/status';

@Controller('bhb-customer-backend/kpis')
export class KpisController {
  private readonly logger = new Logger(KpisController.name);
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getKpis(
    @Query('order_type') orderType?: string[],
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<Kpis> {
    this.logger.log(
      `Retrieving kpis for order type: ${orderType}, start date: ${startDate}, end date: ${endDate}`,
    );
    const orders: Order[] = await this.ordersService.getOrders(
      orderType,
      startDate,
      endDate,
    );
    var kpis: Kpis = {} as Kpis;
    kpis.totalOrders = orders.length;
    kpis.finishedOrders = orders.filter(this.isFinishedOrder).length;
    kpis.inPreparationOrders = orders.filter(this.isInPreparationOrder).length;
    const finishedNonScheduledOrders: Order[] = orders
      .filter(this.isFinishedOrder)
      .filter(this.isNotScheduledOrder);
    kpis.averagePreparationTime =
      finishedNonScheduledOrders.reduce(
        (acc, order) => acc + order?.operation?.kitchenTime,
        0,
      ) / finishedNonScheduledOrders.length;
    kpis.minPreparationTime = Math.min(
      ...finishedNonScheduledOrders.map(
        (order) => order?.operation?.kitchenTime,
      ),
    );
    kpis.maxPreparationTime = Math.max(
      ...finishedNonScheduledOrders.map(
        (order) => order?.operation?.kitchenTime,
      ),
    );
    kpis.awaitingOrders = orders.filter(this.isWaitingForDeliveryOrder).length;
    kpis.inDeliveryOrders = orders.filter(this.isInDeliveryOrder).length;
    //TODO FIX DELIVERY TIME
    kpis.averageDeliveryTime =
      orders
        .filter(this.isDeliveredOrder)
        .reduce((acc, order) => acc + order?.operation?.inDeliveryTime, 0) /
      orders.filter(this.isDeliveredOrder).length;
    kpis.minDeliveryTime = Math.min(
      ...orders.map((order) => order?.operation?.inDeliveryTime),
    );
    kpis.maxDeliveryTime = Math.max(
      ...orders.map((order) => order?.operation?.inDeliveryTime),
    );
    kpis.averageEndToEndTime =
      finishedNonScheduledOrders.reduce(
        (acc, order) => acc + order?.operation?.totalOrderTime,
        0,
      ) / finishedNonScheduledOrders.length;
    kpis.minEndToEndTime = Math.min(
      ...finishedNonScheduledOrders.map(
        (order) => order?.operation?.totalOrderTime,
      ),
    );
    kpis.maxEndToEndTime = Math.max(
      ...finishedNonScheduledOrders.map(
        (order) => order?.operation?.totalOrderTime,
      ),
    );
    kpis.pickupOrders = orders.filter(
      (order) => order.type === Order.TypeEnum.Pickup,
    ).length;
    kpis.deliveredOrders = orders.filter(this.isDeliveredOrder).length;
    kpis.selledProducts = this.getSelledProducts(orders);
    kpis.mostSelledProduct =
      kpis.selledProducts.length > 0
        ? kpis.selledProducts.sort((prd1, prd2) => prd1[1] - prd2[1])[0][0]
        : null;
    return kpis;
  }

  // An order is finished if total order time is set
  isFinishedOrder(order: Order): boolean {
    return (
      order?.operation?.totalOrderTime !== null &&
      order?.operation?.totalOrderTime !== undefined
    );
  }

  // An order is delivered if its status is delivered
  isDeliveredOrder(order: Order): boolean {
    return order?.status?.status === Status.StatusEnum.DELIVERED;
  }

  // An order is in preparation if kitchen time is still undefined
  isInPreparationOrder(order: Order): boolean {
    return (
      order?.operation?.kitchenTime == null ||
      order?.operation?.kitchenTime == undefined
    );
  }

  // An order is waiting for delivery if it is a delivery order and it is ready or prepared
  isWaitingForDeliveryOrder(order: Order): boolean {
    return (
      order.type === Order.TypeEnum.Delivery &&
      (order.status.status === Status.StatusEnum.READY ||
        order.status.status === Status.StatusEnum.PREPARED)
    );
  }

  isInDeliveryOrder(order: Order): boolean {
    return order.status.status === Status.StatusEnum.IN_DELIVERY;
  }

  isNotScheduledOrder(order: Order): boolean {
    return !order.scheduled;
  }

  getSelledProducts(orders: Order[]): Array<[string, number]> {
    var products: Array<[string, number]> = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        var product = products.find((p) => p[0] === item.name);
        if (product) {
          product[1] += item.quantity;
        } else {
          products.push([item.name, item.quantity]);
        }
      });
    });
    return products;
  }
}
