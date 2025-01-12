import { SubItem } from './subItem';
export interface Item {
    id?: string;
    name?: string;
    plu?: string;
    price?: number;
    quantity?: number;
    subItems?: Array<SubItem>;
}
