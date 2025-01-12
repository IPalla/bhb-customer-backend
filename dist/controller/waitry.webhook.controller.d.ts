import { Status } from '../model/status';
import { OrdersService } from '../service/orders.service';
import { WaitryStatusUpdate } from 'src/model/waitry/waitry.status.update';
export declare class WaitryWebhookController {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    createOrder(statusUpdate: WaitryStatusUpdate): Promise<void>;
    getOrderStatusFromWaitry(waitryStatus: any): Status.StatusEnum;
}
