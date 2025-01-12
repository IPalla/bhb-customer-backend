import { EventType } from 'src/model/events';
import { Order } from 'src/model/order';
import { Status } from 'src/model/status';
export type Transition = {
    from: Status.StatusEnum[];
    to: Status.StatusEnum;
    types: Order.TypeEnum[];
    events: EventType[];
};
export declare const validTransitions: Transition[];
export declare function isValidTransition(from: Status.StatusEnum, to: Status.StatusEnum, type: Order.TypeEnum): boolean;
export declare function getEventsFromTransition(from: Status.StatusEnum, to: Status.StatusEnum, type: Order.TypeEnum): EventType[];
