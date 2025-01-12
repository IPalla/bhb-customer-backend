import { HttpException } from '@nestjs/common';
import { Order } from '../model/order';
import { OrderEntity } from '../repository/model/order.entity';
import { Status } from '../model/status';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StatusEntity } from 'src/repository/model/status.entity';
import { GeoLocationService } from './geolocation.service';
export declare class OrdersService {
    private readonly orderModel;
    private readonly statusModel;
    private readonly geolocationService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(orderModel: typeof OrderEntity, statusModel: typeof StatusEntity, geolocationService: GeoLocationService, eventEmitter: EventEmitter2);
    storeOrder(order: Order): Promise<void | HttpException>;
    updateOrderStatus(id: string, status: Status.StatusEnum, createdBy: string, latitude?: string, longitude?: string): Promise<OrderEntity>;
    getOrderById(id: string): Promise<OrderEntity>;
    getOrders(orderType?: string[], startDate?: string, endDate?: string): Promise<Order[]>;
    deleteById(id: string): Promise<void>;
    private distanceCheck;
    private updateOrderRider;
}
