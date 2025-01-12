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
import { Customer } from '../../model/customer';
import { OrderEntity } from './order.entity';

@Table({ tableName: 'customer' })
export class CustomerEntity extends Model<Customer> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;
  @Column(DataType.STRING)
  name: string;
  @Column(DataType.STRING)
  email: string;
  @Column(DataType.STRING)
  address: string;
  @Column(DataType.STRING)
  addressLatitude: string;
  @Column(DataType.STRING)
  addressLongitude: string;
  @Column(DataType.STRING)
  phone_number: string;
  @BelongsTo(() => OrderEntity)
  order: OrderEntity;
  @ForeignKey(() => OrderEntity)
  orderId: number;

  toCustomer(): Customer {
    const customer: Customer = {
      //id: this.id,
      name: this.name,
      email: this.email,
      address: this.address,
      addressLatitude: this.addressLatitude,
      addressLongitude: this.addressLongitude,
      phone_number: this.phone_number,
    };
    return customer;
  }
}
