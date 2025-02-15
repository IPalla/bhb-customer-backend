import { Module } from "@nestjs/common";
import { SquareService } from "../service/square.service";
import { SquareMapper } from "../service/mappers/square.mapper";
import { SquareWebhookController } from "../controller/square-webhook.controller";
import { OrdersService } from "src/service/orders.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { TerminalCheckoutEntity } from "src/entity/terminal-checkout.entity";

@Module({
  imports: [SequelizeModule.forFeature([TerminalCheckoutEntity])],
  controllers: [SquareWebhookController],
  providers: [SquareService, SquareMapper, OrdersService],
  exports: [SquareService, SquareMapper],
})
export class SquareModule {}
