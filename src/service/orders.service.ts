import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../model/order';
import { OrderEntity } from '../repository/model/order.entity';
import { RiderEntity } from '../repository/model/rider.entity';
import { ItemEntity } from '../repository/model/item.entity';
import { Op, Transaction } from 'sequelize';
import { Status } from '../model/status';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StatusEntity } from 'src/repository/model/status.entity';
import { getEventsFromTransition, isValidTransition } from './status.machine';
import { EventType } from 'src/model/events';
import { GeoLocationService } from './geolocation.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectModel(OrderEntity)
    private readonly orderModel: typeof OrderEntity,
    @InjectModel(StatusEntity)
    private readonly statusModel: typeof StatusEntity,
    private readonly geolocationService: GeoLocationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async storeOrder(order: Order): Promise<void | HttpException> {
    this.logger.log(`Storing new order`);
    if (order.type === Order.TypeEnum.Delivery && (order.customer.addressLatitude === undefined || order.customer.addressLongitude === undefined)) {
      this.logger.log('Order is a delivery. Getting coordinates');
      const { latitude, longitude }: { latitude: number; longitude: number } =
        await this.geolocationService.getCoordinatesFromADdress(
          order.customer.address,
        );
      this.logger.log(`Obtained coordinates: ${latitude}, ${longitude}`);
      order.customer.addressLatitude = latitude.toString();
      order.customer.addressLongitude = longitude.toString();
    }
    try {
      const createdOrder = await this.orderModel.create(order, {
        include: [
          OrderEntity.associations['statuses'],
          OrderEntity.associations['rider'],
          OrderEntity.associations['operation'],
          OrderEntity.associations['customer'],
          {
            model: ItemEntity,
            as: 'items',
            include: [ItemEntity.associations['subItems']],
          },
        ],
      });
      if (!createdOrder) {
        throw new Error('Failed to store order');
      }
    } catch (e) {
      this.logger.error(`Error storing the order: ${e.message}`);

      this.logger.error(
        `Errors: ${e?.errors?.map((error) => error.message).join(', ')}`,
      );
      throw new HttpException(
        `Error storing the order: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.eventEmitter.emit(EventType.ORDER_CREATED, order, [
      EventType.ORDER_CREATED,
    ]);
  }

  async updateOrderStatus(
    id: string,
    status: Status.StatusEnum,
    createdBy: string,
    latitude?: string,
    longitude?: string,
  ): Promise<OrderEntity> {
    this.logger.log(`Updating order: ${id}. Status: ${status}`);
    const order = await this.getOrderById(id);
    var orderDto = order.toOrder();
    if (!isValidTransition(orderDto.status.status, status, orderDto.type)) {
      this.logger.error(
        `Invalid status transition from ${orderDto.status.status} to ${status}`,
      );
      throw new HttpException(
        `Invalid status transition from ${orderDto.status.status} to ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    this.distanceCheck(orderDto, status, latitude, longitude);
    await this.statusModel.create({
      status,
      createdBy,
      orderId: order.id,
      latitude,
      longitude,
      createdAtTs: new Date().getTime(),
    });
    if (
      status === Status.StatusEnum.IN_DELIVERY ||
      status === Status.StatusEnum.DELIVERED
    ) {
      this.logger.log(`Assigning rider to order: ${id}`);
      await this.updateOrderRider(id, createdBy, order);
    }

    // Order status updated will always be emitted
    var eventsToEmit: EventType[] = getEventsFromTransition(
      orderDto.status.status,
      status,
      orderDto.type,
    );
    // Once everything is saved, emit the status updated event
    this.getOrderById(id).then((order) => {
      this.eventEmitter.emit(
        EventType.ORDER_STATUS_UPDATED,
        order.toOrder(),
        eventsToEmit,
      );
    });
    return order;
  }

  // This method should return an order based on the id or external order id
  async getOrderById(id: string): Promise<OrderEntity> {
    this.logger.log(`Retrieving order: ${id}`);
    const order = await this.orderModel.findOne({
      where: {
        [Op.or]: [{ id: id }, { externalId: id }],
      },
      include: [
        OrderEntity.associations['statuses'],
        OrderEntity.associations['rider'],
        OrderEntity.associations['operation'],
        OrderEntity.associations['customer'],
        {
          model: ItemEntity,
          as: 'items',
          include: [ItemEntity.associations['subItems']],
        },
      ],
    });
    if (!order) {
      this.logger.error('Order not found');
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  // This method should return a list of orders based on the query parameters
  async getOrders(
    orderType?: string[],
    startDate?: string,
    endDate?: string,
  ): Promise<Order[]> {
    this.logger.log(
      `Getting orders: orderType=${orderType}, startDate=${startDate}, endDate=${endDate}`,
    );
    const whereClause: any = {};
    if (orderType) {
      whereClause.type = orderType;
    }
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }
    const orders = await this.orderModel.findAll({
      include: [
        OrderEntity.associations['statuses'],
        OrderEntity.associations['rider'],
        OrderEntity.associations['operation'],
        OrderEntity.associations['customer'],
        {
          model: ItemEntity,
          as: 'items',
          include: [ItemEntity.associations['subItems']],
        },
      ],
      where: whereClause,
    });
    return orders.map((order) => order.toOrder());
  }

  async deleteById(id: string): Promise<void> {
    this.logger.log(`Deleting order: ${id}`);
    const order = await this.orderModel.findByPk(id);
    if (!order) {
      this.logger.error('Order not found');
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    await order.destroy();
  }

  private distanceCheck(
    orderDto: Order,
    status: string,
    latitude: string,
    longitude: string,
  ) {
    // If order type is delivery we check the distances
    if (orderDto.type === Order.TypeEnum.Delivery) {
      // Check distance to the pickup point
      if (status === Status.StatusEnum.IN_DELIVERY)
        this.geolocationService.verifyInDeliveryDistance({
          latitude,
          longitude,
        });
      // Check distance to the delivery point
      if (status === Status.StatusEnum.DELIVERED)
        this.geolocationService.verifyDeliveryDistance(
          { latitude, longitude },
          {
            latitude: orderDto.customer.addressLatitude,
            longitude: orderDto.customer.addressLongitude,
          },
        );
    }
  }

  private async updateOrderRider(
    orderId: string,
    riderId: string,
    order: OrderEntity,
    transactionHost?: Transaction,
  ): Promise<void> {
    this.logger.log(`Adding rider to order: ${orderId}`);
    if (order.type !== Order.TypeEnum.Delivery) {
      this.logger.error('Order is not a delivery');
      return;
    }
    const rider = await RiderEntity.findByPk(riderId);
    if (!rider) {
      this.logger.error('Rider not found');
      throw new HttpException('Rider not found', HttpStatus.UNAUTHORIZED);
    }
    if (order?.rider !== null && rider.id !== order?.rider_id) {
      this.logger.error(
        `Rider does not match original rider. Original: ${order.rider_id}, new: ${rider.id}`,
      );
      throw new HttpException(
        `Rider does not match original rider. Original: ${order.rider_id}, new: ${rider.id}`,
        HttpStatus.CONFLICT,
      );
    }
    order.rider_id = rider.id;
    await order.save({ transaction: transactionHost });
  }
}
