import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class UpdateCategoryAdminDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_only_kiosk?: boolean;

  @IsOptional()
  @IsBoolean()
  only_web?: boolean;

  @IsOptional()
  @IsString()
  start_at?: string | null;

  @IsOptional()
  @IsString()
  end_at?: string | null;

  @IsOptional()
  @IsString()
  order_types?: string | null;
}
