import { Column, Model, Table, DataType } from "sequelize-typescript";

@Table({ tableName: "order_payments_checkout", timestamps: true })
export class OrderPaymentCheckout extends Model {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column
  currency: string;

  @Column({
    field: "payment_id",
    allowNull: false,
  })
  checkoutId: string;

  @Column({
    field: "payment_id",
    allowNull: true,
  })
  paymentId: string;

  @Column
  status: string;
}
