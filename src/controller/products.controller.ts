import { Controller, Get, Logger, Query } from "@nestjs/common";
import { ProductsService } from "../service/products.service";
import { Product } from "../model/product";

@Controller("bhb-customer-backend/products")
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query("locationId") locationId: string): Promise<Product[]> {
    this.logger.log("Retrieving all products");
    const products = await this.productsService.findAll(locationId);
    this.logger.log("Products retrieved successfully");
    return products;
  }
}
