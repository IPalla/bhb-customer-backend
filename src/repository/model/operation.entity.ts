import {
  Column,
  Model,
  Table,
  PrimaryKey,
  Default,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { OrderEntity } from './order.entity';
import { Operation } from '../../model/operation';

@Table({ tableName: 'operation' })
export class OperationEntity extends Model<Operation> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;
  @Column(DataType.BIGINT)
  createdTs: number;
  @Column(DataType.BIGINT)
  expectedReadyTs: number;
  @Column(DataType.BIGINT)
  expectedDeliveredTs: number;
  @Column(DataType.BIGINT)
  expectedTotalOrderTs: number;
  @Column(DataType.BIGINT)
  kitchenTime: number;
  @Column(DataType.BIGINT)
  inDeliveryTime: number;
  @Column(DataType.BIGINT)
  totalOrderTime: number;
  @BelongsTo(() => OrderEntity)
  order: OrderEntity;
  @ForeignKey(() => OrderEntity)
  orderId: OrderEntity;

  toOperation(): Operation {
    const operation: Operation = {
      id: this.id,
      createdTs: this.createdTs,
      expectedReadyTs: this.expectedReadyTs,
      expectedDeliveredTs: this.expectedDeliveredTs,
      expectedTotalOrderTs: this.expectedTotalOrderTs,
      kitchenTime: this.kitchenTime,
      inDeliveryTime: this.inDeliveryTime,
      totalOrderTime: this.totalOrderTime,
    };
    return operation;
  }
}
