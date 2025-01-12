import { Model } from 'sequelize-typescript';
import { Order } from '../../model/order';
import { RiderEntity } from './rider.entity';
import { CustomerEntity } from './customer.entity';
import { OperationEntity } from './operation.entity';
import { ItemEntity } from './item.entity';
import { StatusEntity } from './status.entity';
export declare class OrderEntity extends Model {
    id: string;
    externalId: string;
    date: string;
    scheduled: boolean;
    type: string;
    channel: string;
    rider_id: string;
    amount: number;
    notes: string;
    customer: CustomerEntity;
    operation: OperationEntity;
    statuses: StatusEntity[];
    items: ItemEntity[];
    rider: RiderEntity;
    toOrder(): Order;
}
