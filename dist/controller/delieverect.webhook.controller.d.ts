import { DeliverectNewOrder } from '../model/deliverect/deliverect.new.order';
import { Order } from '../model/order';
import { OrdersService } from '../service/orders.service';
import { DeliverectUpdateOrder } from 'src/model/deliverect/deliverect.update.order';
export declare class DelieverectWebhookController {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    createOrder(order: DeliverectNewOrder): Promise<void>;
    updateOrder(orderUpdate: DeliverectUpdateOrder): Promise<void>;
    fromDeliverect(deliverectNewOrder: DeliverectNewOrder): Order;
    getExpectedReadyTs(expectedTotalOrderTs: number, type: any): number;
    getExpectedTotalOrderTs(scheduled: boolean, type: Order.TypeEnum, expectedScheduledReadyTime?: string, deliverectTimeZone?: string): number;
    getTypeFromDeliverectOrderType(deliverectOrderType: number, channelLink: string, channel: any, note?: string): Order.TypeEnum;
    getChannelFromOrder(channel: number): Order.ChannelEnum;
    getOrderAmount(deliverectNewOrder: DeliverectNewOrder): number;
    truncateToVarchar255(text: any): string;
}
