import { Injectable, Logger } from "@nestjs/common";
import { Product } from "../model/product";
import { SquareMapper } from "./mappers/square.mapper";
import { SquareService } from "./square.service";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly products: Product[] = [];

  constructor(private readonly squareService: SquareService, private readonly squareMapper: SquareMapper) {
    
  }

  async findAll(): Promise<Product[]> {
    this.logger.log("Retrieving all products");
    const catalog = await this.squareService.getProducts();
    this.logger.log("Mapping products");
    const products = this.squareMapper.productsFromCatalogObject(catalog);
    return products;
  }
}
