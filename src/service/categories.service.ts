import { Injectable, Logger, NotFoundException } from "@nestjs/common";
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
    this.logger.log(
      `Finding all active categories for location: ${locationId}`,
    );

    const categories = await this.categoryModel.findAll({
      where: {
        isActive: true,
        locationId,
      },
      order: [["order", "ASC"]],
    });

    return categories.map(this.mapToCategory);
  }

  async create(category: Category): Promise<void> {
    this.logger.log(`Creating new category: ${JSON.stringify(category)}`);

    try {
      await this.categoryModel.create({
        id: category.id,
        name: category.name,
        image: category.image,
        order: category.order,
        locationId: category.location_id,
        isActive: true,
      });

      this.logger.log(`Category created successfully: ${category.id}`);
    } catch (error) {
      this.logger.error(`Failed to create category:`, error);
      throw error;
    }
  }

  private mapToCategory(entity: CategoryEntity): Category {
    return {
      id: entity.id,
      name: entity.name,
      image: entity.image,
      order: entity.order,
      location_id: entity.locationId,
    };
  }
}
