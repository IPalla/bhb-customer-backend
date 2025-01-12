export type EventType = 'order.created' | 'order.status.updated' | 'operation.order.ready' | 'operation.order.finished' | 'operation.order.in_delivery' | 'operation.order.delivered';
export declare const EventType: {
    ORDER_CREATED: EventType;
    ORDER_STATUS_UPDATED: EventType;
    OPERATION_ORDER_READY: EventType;
    OPERATION_ORDER_FINISHED: EventType;
    OPERATION_ORDER_IN_DELIVERY: EventType;
    OPERATION_ORDER_DELIVERED: EventType;
};
