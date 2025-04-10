import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsISO8601,
  IsPhoneNumber,
} from "class-validator";
import { CouponType } from "../entity/coupon.entity";

export class CouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsBoolean()
  @IsOptional()
  used?: boolean;

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
