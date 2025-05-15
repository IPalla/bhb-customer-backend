import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TerminalCheckoutEntity } from "../entity/terminal-checkout.entity";

@Module({
  imports: [SequelizeModule.forFeature([TerminalCheckoutEntity])],
  exports: [SequelizeModule],
})
export class OrderPaymentCheckoutModule {}
