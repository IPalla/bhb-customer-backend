import { OrdersService } from '../service/orders.service';
import { Order } from '../model/order';
import { Kpis } from 'src/model/kpis';
export declare class KpisController {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    getKpis(orderType?: string[], startDate?: string, endDate?: string): Promise<Kpis>;
    isFinishedOrder(order: Order): boolean;
    isDeliveredOrder(order: Order): boolean;
    isInPreparationOrder(order: Order): boolean;
    isWaitingForDeliveryOrder(order: Order): boolean;
    isInDeliveryOrder(order: Order): boolean;
    isNotScheduledOrder(order: Order): boolean;
    getSelledProducts(orders: Order[]): Array<[string, number]>;
}
