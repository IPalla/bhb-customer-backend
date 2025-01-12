import { ProductsService } from '../service/products.service';
import { Product } from '../model/product';
export declare class ProductsController {
    private readonly productsService;
    private readonly logger;
    constructor(productsService: ProductsService);
    findAll(): Promise<Product[]>;
}
