export type EventType =
  | 'order.created'
  | 'order.status.updated'
  | 'operation.order.ready'
  | 'operation.order.finished'
  | 'operation.order.in_delivery'
  | 'operation.order.delivered';
export const EventType = {
  ORDER_CREATED: 'order.created' as EventType,
  ORDER_STATUS_UPDATED: 'order.status.updated' as EventType,
  OPERATION_ORDER_READY: 'operation.order.ready' as EventType,
  OPERATION_ORDER_FINISHED: 'operation.order.finished' as EventType,
  OPERATION_ORDER_IN_DELIVERY: 'operation.order.in_delivery' as EventType,
  OPERATION_ORDER_DELIVERED: 'operation.order.delivered' as EventType,
};
