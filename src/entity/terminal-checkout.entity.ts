import { Column, Model, Table, DataType } from "sequelize-typescript";

@Table({ tableName: "order_payments_checkout", timestamps: true })
export class TerminalCheckoutEntity extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    field: "order_id",
    allowNull: false,
  })
  orderId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  amount: number;

  @Column
  currency: string;

  @Column({
    field: "checkout_id",
    allowNull: false,
  })
  checkoutId: string;

  @Column({
    field: "device_id",
    allowNull: true,
  })
  deviceId: string;

  @Column({
    field: "payment_id",
    allowNull: true,
  })
  paymentId: string;

  @Column({
    field: "customer_id",
    allowNull: true,
  })
  customerId: string;

  @Column
  status: string;
}
