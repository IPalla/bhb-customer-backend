import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { OrderPaymentCheckout } from "../model/order-payment-checkout.model";

@Module({
  imports: [SequelizeModule.forFeature([OrderPaymentCheckout])],
  exports: [SequelizeModule],
})
export class OrderPaymentCheckoutModule {}
