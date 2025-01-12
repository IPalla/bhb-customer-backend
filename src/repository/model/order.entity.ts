import {
  Column,
  Model,
  Table,
  PrimaryKey,
  Default,
  DataType,
  HasOne,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Order } from '../../model/order';
import { RiderEntity } from './rider.entity';
import { CustomerEntity } from './customer.entity';
import { OperationEntity } from './operation.entity';
import { ItemEntity } from './item.entity';
import { StatusEntity } from './status.entity';

@Table({ tableName: 'order' })
export class OrderEntity extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.STRING)
  id: string;
  @Column(DataType.STRING)
  externalId: string;
  @Column(DataType.DATE)
  date: string;
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  scheduled: boolean;
  @Column(DataType.STRING)
  type: string;
  @Column(DataType.STRING)
  channel: string;
  @Column(DataType.UUID)
  rider_id: string;
  @Column(DataType.DOUBLE)
  amount: number;
  @Column(DataType.STRING)
  notes: string;
  @HasOne(() => CustomerEntity)
  customer: CustomerEntity;
  @HasOne(() => OperationEntity)
  operation: OperationEntity;
  @HasMany(() => StatusEntity)
  statuses: StatusEntity[];
  @HasMany(() => ItemEntity)
  items: ItemEntity[];
  @BelongsTo(() => RiderEntity, 'rider_id')
  rider: RiderEntity;

  toOrder(): Order {
    const order: Order = {
      id: this.id,
      externalId: this.externalId,
      date: this.date,
      scheduled: this.scheduled,
      type: Order.TypeEnum[this.type],
      channel: Order.ChannelEnum[this.channel],
      amount: this.amount,
      notes: this.notes,
      customer: this.customer?.toCustomer(),
      operation: this.operation?.toOperation(),
      statuses: this.statuses?.map((status) => status.toStatus()),
      status: this.statuses
        ? this.statuses
            .sort((a, b) => b.createdAtTs - a.createdAtTs)[0]
            .toStatus()
        : undefined,
      items: this.items?.map((item) => item.toItem()),
      rider: this.rider?.toRider(),
    };
    return order;
  }
}
