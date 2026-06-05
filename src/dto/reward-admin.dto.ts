import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export enum RewardTypeAdmin {
  PRODUCT = "product",
  URL = "url",
  FREE_DELIVERY = "free_delivery",
}

export enum RewardRecurrenceAdmin {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  ONCE = "ONCE",
}

export enum OrderTypeNameAdmin {
  PICKUP = "pickup",
  DINE_IN = "dine-in",
  DELIVERY = "delivery",
}

export class CreateRewardProductModifierDto {
  @IsString()
  modifier_catalog_id: string;

  @IsOptional()
  @IsString()
  modifier_name?: string;

  @IsOptional()
  @IsString()
  modifier_list_catalog_id?: string;

  @IsOptional()
  @IsString()
  modifier_list_selection?: string;

  @IsInt()
  quantity: number;
}

export class CreateRewardProductDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  product_title?: string;

  @IsOptional()
  @IsString()
  catalog_id?: string;

  @IsInt()
  quantity: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardProductModifierDto)
  modifiers?: CreateRewardProductModifierDto[];
}

export class CreateRewardTierEligibilityDto {
  @IsString()
  tier_id: string;
}

export class CreateRewardOrderEligibilityDto {
  @IsEnum(OrderTypeNameAdmin)
  order_type_name: OrderTypeNameAdmin;
}

export class CreateRewardWeekdayEligibilityDto {
  @IsInt()
  day_of_week: number;
}

export class CreateRewardDto {
  @IsString()
  reward_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RewardTypeAdmin)
  reward_type: RewardTypeAdmin;

  @IsOptional()
  @IsString()
  url?: string;

  @IsNumber()
  ends_at: number;

  @IsOptional()
  @IsEnum(RewardRecurrenceAdmin)
  recurrence?: RewardRecurrenceAdmin;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardTierEligibilityDto)
  tier_eligibilities: CreateRewardTierEligibilityDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardOrderEligibilityDto)
  order_eligibilities?: CreateRewardOrderEligibilityDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardWeekdayEligibilityDto)
  weekday_eligibilities?: CreateRewardWeekdayEligibilityDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardProductDto)
  products?: CreateRewardProductDto[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  max_products?: number;
}
