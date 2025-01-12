import { Injectable, Logger } from "@nestjs/common";
import { CatalogObject } from "square";
import { Product } from "src/model/product";
import { Image } from "src/model/image";
import { Option } from "src/model/option";
import { Modifier } from "src/model/modifier";
import { Category } from "src/model/models";

@Injectable()
export class SquareMapper {
    private readonly logger = new Logger(SquareMapper.name);
    constructor() { }

    productsFromCatalogObject(catalogObject: CatalogObject[]): Product[] {
        const items = catalogObject.filter((item) => item.type === "ITEM");
        const categoriesMap: Map<string, Category> = catalogObject.filter(item => item.type === 'CATEGORY').reduce((acc, category) => {
            const ctgry: Category = {
                id: category?.id,
                name: category?.categoryData.name,
            };
            acc[category.id] = ctgry;
            return acc;
        }, new Map());
        const imagesMap: Map<string, Image> = catalogObject.filter(item => item.type === 'IMAGE').reduce((acc, image) => {
            const img: Image = {
                url: image.imageData?.url,
                name: image.imageData?.name,
            };
            acc[image.id] = img;
            return acc;
        }, new Map());
        const modifiersMap: Map<string, Modifier> = catalogObject.filter(item => item.type === 'MODIFIER_LIST').reduce((acc, modifier) => {
            const mdfr: Modifier = {
                id: modifier.id,
                name: modifier?.modifierData?.name,
                type: Modifier.TypeEnum[modifier?.modifierListData?.modifierType],
                selection: Modifier?.SelectionEnum[modifier?.modifierListData?.selectionType],
                options: modifier?.modifierListData?.modifiers.filter(mfr => mfr.type === 'MODIFIER').map((option) => {
                    return {
                        id: option?.id,
                        name: option?.modifierData?.name,
                        price: Number(option?.modifierData?.priceMoney?.amount)
                    } as Option;
                })
            }
            acc[modifier?.id] = mdfr;
            return acc;
        }, new Map());
        return items.map((item) => {
            return {
                id: item?.id,
                catalogId: item?.itemData.variations[0].id,
                name: item?.itemData.name,
                description: item?.itemData.description,
                category: categoriesMap[item?.itemData.categoryId],
                images: item?.itemData?.imageIds?.map((imageId) => imagesMap[imageId]),
                price: Number(item?.itemData.variations[0].itemVariationData.priceMoney.amount),
                modifiers: item?.itemData.modifierListInfo?.map((modifier) => modifiersMap[modifier.modifierListId]),
            } as Product;
        });
    }
}
