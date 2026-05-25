import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { LocationEntity } from "./location.entity";

@Table({
  tableName: "delivery_opening_hours",
  timestamps: true,
})
export class DeliveryOpeningHoursEntity extends Model {
  /** 0 = Sunday, 1 = Monday, … 6 = Saturday (Date.getDay()). */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  day: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  open: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  close: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  break_starts_at: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  break_ends_at: string;

  @ForeignKey(() => LocationEntity)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    references: {
      model: LocationEntity,
      key: "square_location_id",
    },
  })
  square_location_id: string;

  @BelongsTo(() => LocationEntity)
  location: LocationEntity;
}
