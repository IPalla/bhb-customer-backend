import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export enum OrderTypeName {
  PICKUP = "pickup",
  DINE_IN = "dine-in",
  DELIVERY = "delivery",
}

export enum RewardRecurrence {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  ONCE = "ONCE",
}

export class RewardTierEligibilityDto {
  @IsString()
  reward_tier_eligibility_id: string;

  @IsString()
  tier_id: string;

  @IsOptional()
  @IsString()
  tier_name?: string;
}

export class RewardOrderEligibilityDto {
  @IsString()
  reward_order_eligibility_id: string;

  @IsEnum(OrderTypeName)
  order_type_name: OrderTypeName;
}

export class RewardWeekdayEligibilityDto {
  @IsString()
  reward_weekday_eligibility_id: string;

  @IsInt()
  day_of_week: number;
}

export class RewardProductModifierDto {
  @IsString()
  modifier_id: string;

  @IsString()
  modifier_catalog_id: string;

  @IsInt()
  quantity: number;
}

export class RewardProductDto {
  @IsString()
  reward_product_id: string;

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
  @ValidateNested({ each: true })
  @Type(() => RewardProductModifierDto)
  reward_product_modifiers: RewardProductModifierDto[];
}

export class RewardDto {
  @IsString()
  reward_id: string;

  @IsString()
  @IsOptional()
  reward_name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  reward_type: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  ends_at: number;

  @IsNumber()
  created_at: number;

  @IsOptional()
  @IsString()
  recurrence?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardTierEligibilityDto)
  reward_tier_eligibilities: RewardTierEligibilityDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardOrderEligibilityDto)
  reward_order_eligibilities: RewardOrderEligibilityDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardWeekdayEligibilityDto)
  reward_weekday_eligibilities: RewardWeekdayEligibilityDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardProductDto)
  reward_products: RewardProductDto[];

  @IsBoolean()
  claimable: boolean;

  @IsArray()
  checkers: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  max_products?: number;
}
