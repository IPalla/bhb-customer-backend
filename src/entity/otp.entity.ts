import {
  Column,
  Model,
  Table,
  CreatedAt,
  DataType,
} from "sequelize-typescript";

@Table({ tableName: "otp" })
export class OtpEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: "phone_number",
  })
  phoneNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "expiry_date",
  })
  expiryDate: Date;

  @CreatedAt
  createdAt: Date;
}
