import {
  Column,
  Model,
  Table,
  CreatedAt,
  DataType,
  UpdatedAt,
} from "sequelize-typescript";

export enum CouponType {
  FIXED_PERCENTAGE = "FIXED_PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

@Table({ tableName: "coupons" })
export class CouponEntity extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  code: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    field: "remaining_usages",
  })
  remainingUsages: number;

  @Column({
    type: DataType.ENUM(...Object.values(CouponType)),
    allowNull: false,
    field: "type",
  })
  type: CouponType;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    field: "discount",
  })
  discount: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    field: "amount",
  })
  amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "expiration_date",
  })
  expirationDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: "customer_phone_number",
  })
  customerPhoneNumber: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "created_at",
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: "updated_at",
  })
  updatedAt: Date;
}
