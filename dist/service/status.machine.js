"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsFromTransition = exports.isValidTransition = exports.validTransitions = void 0;
const events_1 = require("../model/events");
const order_1 = require("../model/order");
const status_1 = require("../model/status");
const allTypes = [
    order_1.Order.TypeEnum.Delivery,
    order_1.Order.TypeEnum.Dinein,
    order_1.Order.TypeEnum.Pickup,
];
exports.validTransitions = [
    {
        from: [status_1.Status.StatusEnum.PENDING],
        to: status_1.Status.StatusEnum.IN_PROGRESS,
        types: allTypes,
        events: [],
    },
    {
        from: [status_1.Status.StatusEnum.PENDING, status_1.Status.StatusEnum.IN_PROGRESS],
        to: status_1.Status.StatusEnum.PREPARED,
        types: allTypes,
        events: [events_1.EventType.OPERATION_ORDER_READY],
    },
    {
        from: [
            status_1.Status.StatusEnum.PENDING,
            status_1.Status.StatusEnum.IN_PROGRESS,
            status_1.Status.StatusEnum.PREPARED,
        ],
        to: status_1.Status.StatusEnum.READY,
        types: allTypes,
        events: [events_1.EventType.OPERATION_ORDER_READY],
    },
    {
        from: [status_1.Status.StatusEnum.PENDING, status_1.Status.StatusEnum.IN_PROGRESS],
        to: status_1.Status.StatusEnum.PREPARED,
        types: [order_1.Order.TypeEnum.Dinein, order_1.Order.TypeEnum.Pickup],
        events: [events_1.EventType.OPERATION_ORDER_FINISHED],
    },
    {
        from: [
            status_1.Status.StatusEnum.PENDING,
            status_1.Status.StatusEnum.IN_PROGRESS,
            status_1.Status.StatusEnum.PREPARED,
        ],
        to: status_1.Status.StatusEnum.READY,
        types: [order_1.Order.TypeEnum.Dinein, order_1.Order.TypeEnum.Pickup],
        events: [events_1.EventType.OPERATION_ORDER_FINISHED],
    },
    {
        from: [status_1.Status.StatusEnum.READY, status_1.Status.StatusEnum.PREPARED],
        to: status_1.Status.StatusEnum.IN_DELIVERY,
        types: [order_1.Order.TypeEnum.Delivery],
        events: [events_1.EventType.OPERATION_ORDER_IN_DELIVERY],
    },
    {
        from: [status_1.Status.StatusEnum.IN_DELIVERY],
        to: status_1.Status.StatusEnum.DELIVERED,
        types: [order_1.Order.TypeEnum.Delivery],
        events: [
            events_1.EventType.OPERATION_ORDER_DELIVERED,
            events_1.EventType.OPERATION_ORDER_FINISHED,
        ],
    },
];
function isValidTransition(from, to, type) {
    return exports.validTransitions.some((transition) => transition.from.includes(from) &&
        transition.to === to &&
        transition.types.includes(type));
}
exports.isValidTransition = isValidTransition;
function getEventsFromTransition(from, to, type) {
    const transition = exports.validTransitions.find((transition) => transition.from.includes(from) &&
        transition.to === to &&
        transition.types.includes(type));
    return transition ? transition.events : [];
}
exports.getEventsFromTransition = getEventsFromTransition;
//# sourceMappingURL=status.machine.js.map