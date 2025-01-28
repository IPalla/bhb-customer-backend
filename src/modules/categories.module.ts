import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CategoryEntity } from "src/entity/category.entity";
import { CategoriesController } from "src/controller/categories.controller";
import { CategoriesService } from "src/service/categories.service";

@Module({
  imports: [SequelizeModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
