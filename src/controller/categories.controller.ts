import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { CategoriesService } from "../service/categories.service";
import { Category } from "../model/category";

@Controller("bhb-customer-backend/categories")
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    this.logger.log("Retrieving all categories");
    const categories = await this.categoriesService.findAll();
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
