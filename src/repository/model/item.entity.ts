import {
  Column,
  Model,
  Table,
  PrimaryKey,
  Default,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { SubItemEntity } from './sub.item.entity';
import { Item } from '../../model/item';
import { OrderEntity } from './order.entity';

@Table({ tableName: 'item' })
export class ItemEntity extends Model<Item> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;
  @Column(DataType.STRING)
  name: string;
  @Column(DataType.STRING)
  plu: string;
  @Column(DataType.DOUBLE)
  price: number;
  @Column(DataType.INTEGER)
  quantity: number;
  @HasMany(() => SubItemEntity)
  subItems: SubItemEntity[];
  @BelongsTo(() => OrderEntity)
  order: OrderEntity;
  @ForeignKey(() => OrderEntity)
  orderId: OrderEntity;

  toItem(): Item {
    const item: Item = {
      //id: this.id,
      name: this.name,
      plu: this.plu,
      price: this.price,
      quantity: this.quantity,
      subItems: this.subItems.map((subItem) => subItem.toSubItem()),
    };
    return item;
  }
}
