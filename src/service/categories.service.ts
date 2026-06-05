import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CategoryEntity } from "../entity/category.entity";
import { Category } from "src/model/category";
import { Op } from "sequelize";
import { randomUUID } from "crypto";
import { CreateCategoryAdminDto } from "src/dto/create-category-admin.dto";
import { UpdateCategoryAdminDto } from "src/dto/update-category-admin.dto";

export interface CategoryAdmin extends Category {
  is_active: boolean;
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly madridTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  constructor(
    @InjectModel(CategoryEntity)
    private readonly categoryModel: typeof CategoryEntity,
  ) {}

  async findAll(locationId: string, isKiosk = false): Promise<Category[]> {
    this.logger.log(
      `Finding all active categories for location: ${locationId}, is_kiosk: ${isKiosk}`,
    );

    const channelWhere = isKiosk
      ? {
          [Op.or]: [{ isOnlyKiosk: true }, { onlyWeb: false }],
        }
      : {
          [Op.or]: [{ isOnlyKiosk: false }, { onlyWeb: true }],
        };

    const categories = await this.categoryModel.findAll({
      where: {
        isActive: true,
        square_location_id: locationId,
        ...channelWhere,
      },
      order: [["order", "ASC"]],
    });

    return categories
      .filter((category) =>
        this.isCategoryActiveBySchedule(category.startAt, category.endAt),
      )
      .map((category) => this.mapToCategory(category));
  }

  async findAllForAdmin(locationId: string): Promise<CategoryAdmin[]> {
    this.logger.log(`findAllForAdmin start locationId=${locationId}`);
    const categories = await this.categoryModel.findAll({
      where: { square_location_id: locationId },
      order: [["order", "ASC"]],
    });
    this.logger.log(`findAllForAdmin end count=${categories.length}`);
    return categories.map((category) => this.mapToCategoryAdmin(category));
  }

  async create(category: Category): Promise<void> {
    this.logger.log(`Creating new category: ${JSON.stringify(category)}`);

    try {
      await this.categoryModel.create({
        id: category.id ?? randomUUID(),
        name: category.name,
        image: category.image,
        order: category.order,
        square_location_id: category.location_id,
        isActive: true,
        isOnlyKiosk: category.is_only_kiosk ?? false,
        onlyWeb: category.only_web ?? false,
        startAt: category.start_at ?? null,
        endAt: category.end_at ?? null,
        order_types: category.order_types ?? null,
      });

      this.logger.log(`Category created successfully: ${category.location_id}`);
    } catch (error) {
      this.logger.error(`Failed to create category:`, error);
      throw error;
    }
  }

  async createForAdmin(dto: CreateCategoryAdminDto): Promise<CategoryAdmin> {
    this.logger.log(`createForAdmin start locationId=${dto.location_id}`);
    const entity = await this.categoryModel.create({
      id: dto.id,
      name: dto.name,
      image: dto.image ?? null,
      order: dto.order ?? 0,
      square_location_id: dto.location_id,
      isActive: true,
      isOnlyKiosk: dto.is_only_kiosk ?? false,
      onlyWeb: dto.only_web ?? false,
      startAt: dto.start_at ?? null,
      endAt: dto.end_at ?? null,
      order_types: dto.order_types ?? null,
    });
    this.logger.log(`createForAdmin end id=${entity.id}`);
    return this.mapToCategoryAdmin(entity);
  }

  async updateForAdmin(
    id: string,
    dto: UpdateCategoryAdminDto,
  ): Promise<CategoryAdmin> {
    this.logger.log(`updateForAdmin start id=${id}`);
    const entity = await this.categoryModel.findByPk(id);
    if (!entity) {
      throw new NotFoundException(`Category not found: ${id}`);
    }

    await entity.update({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.image !== undefined && { image: dto.image }),
      ...(dto.order !== undefined && { order: dto.order }),
      ...(dto.is_active !== undefined && { isActive: dto.is_active }),
      ...(dto.is_only_kiosk !== undefined && {
        isOnlyKiosk: dto.is_only_kiosk,
      }),
      ...(dto.only_web !== undefined && { onlyWeb: dto.only_web }),
      ...(dto.start_at !== undefined && { startAt: dto.start_at }),
      ...(dto.end_at !== undefined && { endAt: dto.end_at }),
      ...(dto.order_types !== undefined && { order_types: dto.order_types }),
    });

    await entity.reload();
    this.logger.log(`updateForAdmin end id=${id}`);
    return this.mapToCategoryAdmin(entity);
  }

  private mapToCategoryAdmin(entity: CategoryEntity): CategoryAdmin {
    return {
      ...this.mapToCategory(entity),
      is_active: entity.isActive,
    };
  }

  private mapToCategory(entity: CategoryEntity): Category {
    return {
      id: entity.id,
      name: entity.name,
      image: entity.image,
      order: entity.order,
      location_id: entity.square_location_id,
      is_only_kiosk: entity.isOnlyKiosk,
      only_web: entity.onlyWeb,
      start_at: entity.startAt,
      end_at: entity.endAt,
      order_types: entity.order_types ?? undefined,
    };
  }

  private isCategoryActiveBySchedule(
    startAt: string | null,
    endAt: string | null,
  ): boolean {
    // If no schedule is defined, category stays active the whole day.
    if (!startAt || !endAt) {
      return true;
    }

    const madridNow = this.madridTimeFormatter.formatToParts(new Date());
    const hoursPart = madridNow.find((part) => part.type === "hour")?.value;
    const minutesPart = madridNow.find((part) => part.type === "minute")?.value;
    const madridHours = Number(hoursPart);
    const madridMinutes = Number(minutesPart);
    if (Number.isNaN(madridHours) || Number.isNaN(madridMinutes)) {
      return true;
    }

    const currentMinutes = madridHours * 60 + madridMinutes;
    const startMinutes = this.timeToMinutes(startAt);
    const endMinutes = this.timeToMinutes(endAt);

    if (startMinutes === null || endMinutes === null) {
      return true;
    }

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  private timeToMinutes(value: string): number | null {
    const parts = value.split(":");
    if (parts.length < 2) {
      return null;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }
}
