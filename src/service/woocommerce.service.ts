import { Injectable, Logger } from "@nestjs/common";





@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);


}

export interface WooCommerceProduct {
    id: number;
    name: string;
    sku: string;
    price: string;
    images: { src: string }[];
    categories: { id: number; name: string }[];
    variations: WooCommerceVariation[];
    // Add other fields as necessary
}

export interface WooCommerceVariationItem {
    id: number;
    name: string;
    sku: string;
    price: string;
    // Add other fields as necessary
}

export interface WooCommerceVariation {
    id: number;
    name: string;
    max_selection: number;
    mandatory: boolean;
    items: WooCommerceVariationItem[];
    // Add other fields as necessary
}