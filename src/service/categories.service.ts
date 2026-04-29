import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CategoryEntity } from "../entity/category.entity";
import { Category } from "src/model/category";
import { Op } from "sequelize";

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
      .map(this.mapToCategory);
  }

  async create(category: Category): Promise<void> {
    this.logger.log(`Creating new category: ${JSON.stringify(category)}`);

    try {
      await this.categoryModel.create({
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
