import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

export class OpeningHoursDto {
  @IsNumber()
  day: number;

  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsString()
  @IsOptional()
  break_starts_at?: string;

  @IsString()
  @IsOptional()
  break_ends_at?: string;
}

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsBoolean()
  is_closed: boolean;

  @IsString()
  square_location_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  opening_hours: OpeningHoursDto[];
}
