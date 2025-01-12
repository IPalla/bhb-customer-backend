import { Injectable } from '@nestjs/common';
import { Product } from '../model/product';

@Injectable()
export class ProductsService {
    private readonly products: Product[] = [
        {
            name: 'Bacon Cheeseburger',
            sku: 'P-BC-001',
            price: 1295,
            image: 'https://example.com/images/bacon_cheeseburger.jpg',
            category: 'Burgers',
            variations: [
                {
                    name: 'Sauce',
                    max_selection: 2,
                    mandatory: true,
                    items: [
                        { name: 'Ketchup', sku: 'V-K-001', price: 50 },
                        { name: 'Mustard', sku: 'V-M-001', price: 50 },
                    ],
                },
            ],
        },
    ];

    findAll(): Product[] {
        return this.products;
    }
}