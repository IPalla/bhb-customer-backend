import { EventType } from 'src/model/events';
import { Order } from 'src/model/order';
import { NotificationsService } from 'src/service/notifications.service';
import { OperationsService } from 'src/service/operations.service';
export declare class OrderEventReceiver {
    private readonly notificationsService;
    private readonly operationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService, operationsService: OperationsService);
    handleOrderCreatedEvent(order: Order): void;
    handleOrderUpdatedEvent(order: Order, events: EventType[]): void;
}
