import { Customer } from './customer';
import { Item } from './item';
import { Operation } from './operation';
import { Rider } from './rider';
import { Status } from './status';
export interface Order {
    id?: string;
    externalId?: string;
    date?: string;
    scheduled?: boolean;
    type?: Order.TypeEnum;
    channel?: Order.ChannelEnum;
    notes?: string;
    amount?: number;
    rider?: Rider;
    customer?: Customer;
    operation?: Operation;
    items?: Array<Item>;
    status?: Status;
    statuses?: Array<Status>;
}
export declare namespace Order {
    type TypeEnum = 'Delivery' | 'Pickup' | 'Dinein' | 'Unknown';
    const TypeEnum: {
        Delivery: TypeEnum;
        Pickup: TypeEnum;
        Dinein: TypeEnum;
        Unknown: TypeEnum;
    };
    type ChannelEnum = 'Web' | 'Glovo' | 'JustEat' | 'Uber' | 'Waitry' | 'Unknown';
    const ChannelEnum: {
        Web: ChannelEnum;
        Glovo: ChannelEnum;
        JustEat: ChannelEnum;
        Uber: ChannelEnum;
        Waitry: ChannelEnum;
        Deliverect: ChannelEnum;
        Unknown: ChannelEnum;
    };
}
