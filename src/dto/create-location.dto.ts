import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";
import { OpeningHoursDto } from "./opening-hours.dto";

export { OpeningHoursDto };

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  @IsOptional()
  delivery_opening_hours?: OpeningHoursDto[];
}
