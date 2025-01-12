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
import { ItemEntity } from './item.entity';
import { SubItem } from '../../model/subItem';

@Table({ tableName: 'sub_item' })
export class SubItemEntity extends Model<SubItem> {
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
  @BelongsTo(() => ItemEntity)
  item: ItemEntity;
  @ForeignKey(() => ItemEntity)
  itemId: ItemEntity;

  toSubItem(): SubItem {
    const subItem: SubItem = {
      id: this.id,
      name: this.name,
      plu: this.plu,
      price: this.price,
      quantity: this.quantity,
    };
    return subItem;
  }
}
