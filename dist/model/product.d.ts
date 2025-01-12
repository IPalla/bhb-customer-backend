export declare class Product {
    name: string;
    sku: string;
    price: number;
    image: string;
    category: string;
    variations: Variation[];
}
export declare class Variation {
    name: string;
    max_selection: number;
    mandatory: boolean;
    items: VariationItem[];
}
export declare class VariationItem {
    name: string;
    sku: string;
    price: number;
}
