import { Module } from "@nestjs/common";
import { OrdersController } from "../controller/orders.controller";
import { OrdersService } from "../service/orders.service";
import { SquareModule } from "./square.module";
import { OrderPaymentCheckoutModule } from "./order-payment-checkout.module";
import { DeliveryManagerModule } from "./delivery-manager.module";
import { CouponModule } from "./coupon.module";
import { EventsService } from "src/service/events.service";
@Module({
  imports: [
    SquareModule,
    OrderPaymentCheckoutModule,
    DeliveryManagerModule,
    CouponModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, EventsService],
  exports: [OrdersService],
})
export class OrdersModule {}
