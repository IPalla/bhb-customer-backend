import { OrdersService } from '../service/orders.service';
import { Order } from '../model/order';
import { StatusUpdate } from '../model/statusUpdate';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from 'src/model/events';
export declare class OrdersController {
    private readonly ordersService;
    private readonly eventEmitter;
    private readonly logger;
    private notificationsObservable;
    constructor(ordersService: OrdersService, eventEmitter: EventEmitter2);
    getOrders(orderType?: string[], startDate?: string, endDate?: string): Promise<Order[]>;
    getOrderById(id: string): Promise<Order>;
    deleteOrderById(id: string): Promise<void>;
    updateOrderStatus(req: any, id: string, updateOrderStatusDto: StatusUpdate, latitude: string, longitude: string): Promise<void>;
    getOrderNotifications(): Observable<MessageEvent>;
    fromEventEmitterToEvent(eventEmitter: EventEmitter2, eventType: EventType): Observable<MessageEvent<any>>;
}
