import { Module } from "@nestjs/common";
import { SquareModule } from "./square.module";
import { CustomersService } from "src/service/customers.service";
import { CustomersController } from "src/controller/customers.controller";

@Module({
  imports: [SquareModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomerModule {}
