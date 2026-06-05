import { IsOptional, IsString } from "class-validator";

export class AdminAuthDto {
  @IsOptional()
  @IsString()
  apiKey?: string;
}
