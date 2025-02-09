import { Module } from "@nestjs/common";
import { OrdersController } from "../controller/orders.controller";
import { OrdersService } from "../service/orders.service";
import { SquareModule } from "./square.module";
import { OrderPaymentCheckoutModule } from "./order-payment-checkout.module";

@Module({
  imports: [SquareModule, OrderPaymentCheckoutModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
