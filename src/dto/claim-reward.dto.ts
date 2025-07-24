import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateRewardProductModifierDto {
  @IsString()
  modifier_catalog_id: string;

  @IsInt()
  quantity: number;
}

export class CreateRewardProductDto {
  @IsOptional()
  @IsString()
  catalog_id?: string;

  @IsInt()
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardProductModifierDto)
  modifiers: CreateRewardProductModifierDto[];
}

export class ClaimRewardDto {
  @IsString()
  reward_id: string;
  @IsOptional()
  @IsString()
  reward_name?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => CreateRewardProductDto)
  products?: CreateRewardProductDto[];
}
