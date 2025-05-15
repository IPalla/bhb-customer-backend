import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsISO8601,
  IsPhoneNumber,
  Min,
} from "class-validator";
import { CouponType } from "../entity/coupon.entity";

export class CouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  remainingUsages?: number;

  @IsEnum(CouponType)
  @IsOptional()
  type?: CouponType;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsISO8601()
  @IsOptional()
  expirationDate?: string;

  @IsOptional()
  customerPhoneNumber?: string;
}
