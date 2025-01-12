import { Controller, Get, Logger } from "@nestjs/common";
import { ProductsService } from "../service/products.service";
import { Product } from "../model/product";

@Controller("bhb-customer-backend/products")
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<Product[]> {
    this.logger.log("Retrieving all products");
    const products = await this.productsService.findAll();
    this.logger.log("Products retrieved successfully");
    return products;
  }
}
