import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Logger,
  ParseIntPipe,
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
      used: false,
      expirationDate: moment().add(6, "month").toDate().toISOString(),
    });
  }

  @Get()
  async findAll(): Promise<CouponEntity[]> {
    this.logger.log("Fetching all coupons");
    return this.couponService.findAll();
  }

  @Get(":id")
  async findOne(
    @Param("id") code: string,
    @Req() request: RequestWithUser,
  ): Promise<CouponEntity> {
    this.logger.log(`Fetching coupon with id: ${code}`);
    const customerPhoneNumber = request.user?.customer?.phoneNumber;
    return this.couponService.findByCodeAndCustomer(code, customerPhoneNumber);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() couponDto: CouponDto,
  ): Promise<CouponResponse> {
    this.logger.log(`Updating coupon with id: ${id}`);
    return this.couponService.update(id, couponDto);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number): Promise<CouponResponse> {
    this.logger.log(`Deleting coupon with id: ${id}`);
    return this.couponService.remove(id);
  }
}
