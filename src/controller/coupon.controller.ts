import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Logger,
  Req,
} from "@nestjs/common";
import { CouponService } from "../service/coupon.service";
import { CouponDto } from "../dto/coupon.dto";
import { CouponEntity } from "../entity/coupon.entity";
import { RequestWithUser } from "src/guards/jwt.guard";
import * as moment from "moment";

interface CouponResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Controller("bhb-customer-backend/coupons")
export class CouponController {
  private readonly logger = new Logger(CouponController.name);

  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(
    @Body() couponDto: CouponDto,
    @Req() request: RequestWithUser,
  ): Promise<CouponResponse> {
    this.logger.log(`Creating coupon with code: ${couponDto.code}`);
    return this.couponService.create({
      ...couponDto,
      remainingUsages: couponDto.remainingUsages || 1,
      expirationDate: moment().add(6, "month").toDate().toISOString(),
    });
  }

  @Get()
  async findAll(): Promise<CouponEntity[]> {
    this.logger.log("Fetching all coupons");
    return this.couponService.findAll();
  }

  @Get(":code")
  async findOne(
    @Param("code") code: string,
    @Req() request: RequestWithUser,
  ): Promise<CouponEntity> {
    this.logger.log(`Fetching coupon with code: ${code}`);
    const customerPhoneNumber = request.user?.customer?.phoneNumber;
    return this.couponService.findByCodeAndCustomer(code, customerPhoneNumber);
  }

  @Put(":code")
  async update(
    @Param("code") code: string,
    @Body() couponDto: CouponDto,
  ): Promise<CouponResponse> {
    this.logger.log(`Updating coupon with code: ${code}`);
    return this.couponService.update(code, couponDto);
  }

  @Post(":code/use")
  async useCoupon(
    @Param("code") code: string,
    @Req() request: RequestWithUser,
  ): Promise<CouponResponse> {
    this.logger.log(`Using coupon with code: ${code}`);
    const customerPhoneNumber = request.user?.customer?.phoneNumber;
    return this.couponService.useCoupon(code, customerPhoneNumber);
  }

  @Delete(":code")
  async remove(@Param("code") code: string): Promise<CouponResponse> {
    this.logger.log(`Deleting coupon with code: ${code}`);
    return this.couponService.remove(code);
  }
}
