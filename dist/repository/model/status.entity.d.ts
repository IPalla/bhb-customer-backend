import { Model } from 'sequelize-typescript';
import { OrderEntity } from './order.entity';
import { Status } from '../../model/status';
export declare class StatusEntity extends Model {
    id: string;
    status: string;
    createdBy: string;
    createdAtTs: number;
    latitude: string;
    longitude: string;
    order: OrderEntity;
    orderId: OrderEntity;
    toStatus(): Status;
}
