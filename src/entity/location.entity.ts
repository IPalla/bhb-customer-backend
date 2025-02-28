import { Column, Model, Table, DataType, HasMany } from "sequelize-typescript";
import { OpeningHoursEntity } from "./opening-hours.entity";

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
  is_closed: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  square_location_id: string;

  @HasMany(() => OpeningHoursEntity)
  opening_hours: OpeningHoursEntity[];
}
