import { Body, Controller, Get, Logger, Post, Query } from "@nestjs/common";
import { CategoriesService } from "../service/categories.service";
import { Category } from "../model/category";

@Controller("bhb-customer-backend/categories")
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(
    @Query("locationId") locationId: string,
    @Query("is_kiosk") isKiosk: string,
  ): Promise<Category[]> {
    const kioskMode = isKiosk === "true";
    this.logger.log(
      `Retrieving categories for location: ${locationId}, is_kiosk: ${kioskMode}`,
    );
    const categories = await this.categoriesService.findAll(locationId, kioskMode);
    this.logger.log("Categories retrieved successfully");
    return categories;
  }

  @Post()
  async create(@Body() category: Category): Promise<any> {
    this.logger.log("Creating new category");
    await this.categoriesService.create(category);
    this.logger.log("Category created successfully");
    return {};
  }
}
