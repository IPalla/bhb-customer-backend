import { Module } from "@nestjs/common";
import { SquareService } from "src/service/square.service";
import { SquareMapper } from "src/service/mappers/square.mapper";
import { CustomersService } from "src/service/customers.service";
import { CustomersController } from "src/controller/customers.controller";

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, SquareService, SquareMapper],
  exports: [CustomersService],
})
export class CustomerModule {}
