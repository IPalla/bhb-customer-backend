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
import { Status } from '../../model/status';

@Table({ tableName: 'status' })
export class StatusEntity extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;
  @Column(DataType.STRING)
  status: string;
  @Column(DataType.STRING)
  createdBy: string;
  @Column(DataType.BIGINT)
  createdAtTs: number;
  @Column(DataType.STRING)
  latitude: string;
  @Column(DataType.STRING)
  longitude: string;
  @BelongsTo(() => OrderEntity)
  order: OrderEntity;
  @ForeignKey(() => OrderEntity)
  orderId: OrderEntity;

  toStatus(): Status {
    const status: Status = {
      createdAt: this.createdAt,
      createdAtTs: this.createdAtTs,
      createdBy: this.createdBy,
      latitude: this.latitude,
      longitude: this.longitude,
      status: Status.StatusEnum[this.status],
    };
    return status;
  }
}
