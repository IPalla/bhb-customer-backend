import { Column, Model, Table, DataType, HasMany } from "sequelize-typescript";
import { OpeningHoursEntity } from "./opening-hours.entity";
import { DeliveryOpeningHoursEntity } from "./delivery-opening-hours.entity";

@Table({
  tableName: "locations",
  timestamps: true,
})
export class LocationEntity extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  high_demand: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  square_location_id: string;

  @HasMany(() => OpeningHoursEntity, {
    foreignKey: "square_location_id",
    sourceKey: "square_location_id",
  })
  opening_hours: OpeningHoursEntity[];

  @HasMany(() => DeliveryOpeningHoursEntity, {
    foreignKey: "square_location_id",
    sourceKey: "square_location_id",
  })
  delivery_opening_hours: DeliveryOpeningHoursEntity[];
}
