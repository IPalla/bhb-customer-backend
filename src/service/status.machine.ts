import { EventType } from 'src/model/events';
import { Order } from 'src/model/order';
import { Status } from 'src/model/status';

export type Transition = {
  from: Status.StatusEnum[];
  to: Status.StatusEnum;
  types: Order.TypeEnum[];
  events: EventType[];
};

const allTypes = [
  Order.TypeEnum.Delivery,
  Order.TypeEnum.Dinein,
  Order.TypeEnum.Pickup,
];

export const validTransitions: Transition[] = [
  {
    from: [Status.StatusEnum.PENDING],
    to: Status.StatusEnum.IN_PROGRESS,
    types: allTypes,
    events: [],
  },
  // Ready event
  {
    from: [Status.StatusEnum.PENDING, Status.StatusEnum.IN_PROGRESS],
    to: Status.StatusEnum.PREPARED,
    types: allTypes,
    events: [EventType.OPERATION_ORDER_READY],
  },
  {
    from: [
      Status.StatusEnum.PENDING,
      Status.StatusEnum.IN_PROGRESS,
      Status.StatusEnum.PREPARED,
    ],
    to: Status.StatusEnum.READY,
    types: allTypes,
    events: [EventType.OPERATION_ORDER_READY],
  },
  // For pickup and dine in, when order is ready or prepared, it is also finished
  {
    from: [Status.StatusEnum.PENDING, Status.StatusEnum.IN_PROGRESS],
    to: Status.StatusEnum.PREPARED,
    types: [Order.TypeEnum.Dinein, Order.TypeEnum.Pickup],
    events: [EventType.OPERATION_ORDER_FINISHED],
  },
  {
    from: [
      Status.StatusEnum.PENDING,
      Status.StatusEnum.IN_PROGRESS,
      Status.StatusEnum.PREPARED,
    ],
    to: Status.StatusEnum.READY,
    types: [Order.TypeEnum.Dinein, Order.TypeEnum.Pickup],
    events: [EventType.OPERATION_ORDER_FINISHED],
  },
  // Delivery events
  {
    from: [Status.StatusEnum.READY, Status.StatusEnum.PREPARED],
    to: Status.StatusEnum.IN_DELIVERY,
    types: [Order.TypeEnum.Delivery],
    events: [EventType.OPERATION_ORDER_IN_DELIVERY],
  },
  {
    from: [Status.StatusEnum.IN_DELIVERY],
    to: Status.StatusEnum.DELIVERED,
    types: [Order.TypeEnum.Delivery],
    events: [
      EventType.OPERATION_ORDER_DELIVERED,
      EventType.OPERATION_ORDER_FINISHED,
    ],
  },
];

export function isValidTransition(
  from: Status.StatusEnum,
  to: Status.StatusEnum,
  type: Order.TypeEnum,
): boolean {
  return validTransitions.some(
    (transition) =>
      transition.from.includes(from) &&
      transition.to === to &&
      transition.types.includes(type),
  );
}

export function getEventsFromTransition(
  from: Status.StatusEnum,
  to: Status.StatusEnum,
  type: Order.TypeEnum,
): EventType[] {
  const transition = validTransitions.find(
    (transition) =>
      transition.from.includes(from) &&
      transition.to === to &&
      transition.types.includes(type),
  );
  return transition ? transition.events : [];
}
