// Products module

import { Module } from "@nestjs/common";
import { ProductsController } from "../controller/products.controller";
import { ProductsService } from "../service/products.service";
import { SquareMapper } from "src/service/mappers/square.mapper";
import { SquareService } from "src/service/square.service";
@Module({
  controllers: [ProductsController],
  providers: [ProductsService, SquareService, SquareMapper],
})
export class ProductsModule {}
