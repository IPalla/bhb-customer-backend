import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

/** day: 0 = Sunday, 1 = Monday, … 6 = Saturday (Date.getDay()). */
export class OpeningHoursDto {
  @IsNumber()
  @Min(0)
  @Max(6)
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
