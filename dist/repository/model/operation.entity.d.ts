import { Model } from 'sequelize-typescript';
import { OrderEntity } from './order.entity';
import { Operation } from '../../model/operation';
export declare class OperationEntity extends Model<Operation> {
    id: string;
    createdTs: number;
    expectedReadyTs: number;
    expectedDeliveredTs: number;
    expectedTotalOrderTs: number;
    kitchenTime: number;
    inDeliveryTime: number;
    totalOrderTime: number;
    order: OrderEntity;
    orderId: OrderEntity;
    toOperation(): Operation;
}
