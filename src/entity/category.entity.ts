import { Column, Model, Table, DataType } from "sequelize-typescript";

@Table({ tableName: "categories" })
export class CategoryEntity extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  order: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: "is_active",
  })
  isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "is_only_kiosk",
  })
  isOnlyKiosk: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: "only_web",
  })
  onlyWeb: boolean;

  @Column({
    type: DataType.TIME,
    allowNull: true,
    field: "start_at",
  })
  startAt: string | null;

  @Column({
    type: DataType.TIME,
    allowNull: true,
    field: "end_at",
  })
  endAt: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  square_location_id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  order_types: string | null;
}
