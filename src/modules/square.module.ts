import { Module } from "@nestjs/common";
import { SquareService } from "../service/square.service";
import { SquareMapper } from "../service/mappers/square.mapper";
import { SquareWebhookController } from "../controller/square-webhook.controller";
import { OrdersService } from "src/service/orders.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { TerminalCheckoutEntity } from "src/entity/terminal-checkout.entity";
import { WebhookService } from "src/service/webhook.service";
import { DeliveryManagerModule } from "./delivery-manager.module";
import { CouponModule } from "./coupon.module";

@Module({
  imports: [
    SequelizeModule.forFeature([TerminalCheckoutEntity]),
    DeliveryManagerModule,
    CouponModule,
  ],
  controllers: [SquareWebhookController],
  providers: [SquareService, SquareMapper, OrdersService, WebhookService],
  exports: [SquareService, SquareMapper],
})
export class SquareModule {}
