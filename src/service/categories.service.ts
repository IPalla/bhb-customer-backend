import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CategoryEntity } from "../entity/category.entity";
import { Category } from "src/model/category";

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectModel(CategoryEntity)
    private readonly categoryModel: typeof CategoryEntity,
  ) {}

  async findAll(locationId: string): Promise<Category[]> {
    this.logger.log(`Finding all categories for location: ${locationId}`);
    const categories = await this.categoryModel.findAll({
      where: { isActive: true, locationId: locationId },
      order: [["order", "ASC"]],
    });
    return categories.map(
      (category) =>
        ({
          id: category.id,
          name: category.name,
          image: category.image,
          order: category.order,
        }) as Category,
    );
  }

  async create(category: Category): Promise<void> {
    await this.categoryModel.create({
      id: category.id,
      name: category.name,
      image: category.image,
      order: category.order,
      locationId: category.location_id,
    });
  }
}
