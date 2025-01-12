import { Model } from 'sequelize-typescript';
import { SubItemEntity } from './sub.item.entity';
import { Item } from '../../model/item';
import { OrderEntity } from './order.entity';
export declare class ItemEntity extends Model<Item> {
    id: string;
    name: string;
    plu: string;
    price: number;
    quantity: number;
    subItems: SubItemEntity[];
    order: OrderEntity;
    orderId: OrderEntity;
    toItem(): Item;
}
