import { Model } from 'sequelize-typescript';
import { OrderEntity } from './order.entity';
import { Rider } from '../../model/rider';
export declare class RiderEntity extends Model {
    id: string;
    name: string;
    phone_number: string;
    password: string;
    orders: OrderEntity[];
    toRider(): Rider;
}
