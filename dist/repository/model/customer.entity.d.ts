import { Model } from 'sequelize-typescript';
import { Customer } from '../../model/customer';
import { OrderEntity } from './order.entity';
export declare class CustomerEntity extends Model<Customer> {
    id: string;
    name: string;
    email: string;
    address: string;
    addressLatitude: string;
    addressLongitude: string;
    phone_number: string;
    order: OrderEntity;
    orderId: number;
    toCustomer(): Customer;
}
