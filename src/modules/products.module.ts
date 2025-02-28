// Products module

import { Module } from "@nestjs/common";
import { ProductsController } from "../controller/products.controller";
import { ProductsService } from "../service/products.service";
import { SquareModule } from "./square.module";

@Module({
  imports: [SquareModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
