import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { OpeningHoursDto } from "./opening-hours.dto";

export class UpdateOpeningHoursListDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHoursDto)
  opening_hours: OpeningHoursDto[];
}
