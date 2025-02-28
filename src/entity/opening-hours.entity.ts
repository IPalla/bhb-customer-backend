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
  tableName: "opening_hours",
  timestamps: true,
})
export class OpeningHoursEntity extends Model {
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
