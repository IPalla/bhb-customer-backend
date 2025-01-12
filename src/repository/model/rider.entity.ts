import {
  Column,
  Model,
  Table,
  PrimaryKey,
  Default,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { OrderEntity } from './order.entity';
import { Rider } from '../../model/rider';

@Table({ tableName: 'rider' })
export class RiderEntity extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  id: string;
  @Column(DataType.STRING)
  name: string;
  @Column(DataType.STRING)
  phone_number: string;
  @Column(DataType.STRING)
  password: string;
  @HasMany(() => OrderEntity, 'rider_id')
  orders: OrderEntity[];

  toRider(): Rider {
    const rider: Rider = {
      id: this.id,
      name: this.name,
      phone: this.phone_number,
    };
    return rider;
  }
}
