import { Model } from 'sequelize-typescript';
import { ItemEntity } from './item.entity';
import { SubItem } from '../../model/subItem';
export declare class SubItemEntity extends Model<SubItem> {
    id: string;
    name: string;
    plu: string;
    price: number;
    quantity: number;
    item: ItemEntity;
    itemId: ItemEntity;
    toSubItem(): SubItem;
}
