import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  Delete,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "src/decorators/public.decorator";
import { Admin } from "src/decorators/admin.decorator";
import { LocationsService } from "src/service/locations.service";
import {
  CategoriesService,
  CategoryAdmin,
} from "src/service/categories.service";
import { LocationEntity } from "src/entity/location.entity";
import { AdminAuthDto } from "src/dto/admin-auth.dto";
import { UpdateStoreStatusDto } from "src/dto/update-store-status.dto";
import { CreateCategoryAdminDto } from "src/dto/create-category-admin.dto";
import { UpdateCategoryAdminDto } from "src/dto/update-category-admin.dto";
import { UpdateOpeningHoursListDto } from "src/dto/update-opening-hours-list.dto";
import { RewardsAdminService } from "src/service/rewards-admin.service";
import { CreateRewardDto } from "src/dto/reward-admin.dto";
import { CouponService } from "src/service/coupon.service";
import { CouponDto, CouponResponse } from "src/dto/coupon.dto";
import { CouponEntity } from "src/entity/coupon.entity";

@Controller("bhb-customer-backend/admin")
export class AdminController {
  private readonly logger = new Logger(AdminController.name);
  private readonly apiKey: string;

  constructor(
    private readonly locationsService: LocationsService,
    private readonly categoriesService: CategoriesService,
    private readonly rewardsAdminService: RewardsAdminService,
    private readonly couponService: CouponService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>("close.apiKey");
  }

  @Public()
  @Post("auth")
  validateAuth(
    @Body() body: AdminAuthDto,
    @Headers("x-api-key") headerKey?: string,
  ): { valid: true } {
    const key = headerKey ?? body.apiKey;
    if (!key || key !== this.apiKey) {
      this.logger.warn("Admin auth failed: invalid API key");
      throw new UnauthorizedException("Invalid API key");
    }
    this.logger.log("Admin auth successful");
    return { valid: true };
  }

  @Admin()
  @Get("locations")
  getLocations(): Promise<LocationEntity[]> {
    this.logger.log("getLocations start");
    return this.locationsService.getAllLocations();
  }

  @Admin()
  @Patch("locations/:squareLocationId/status")
  updateStoreStatus(
    @Param("squareLocationId") squareLocationId: string,
    @Body() body: UpdateStoreStatusDto,
  ): Promise<LocationEntity> {
    this.logger.log(
      `updateStoreStatus squareLocationId=${squareLocationId} closed=${body.closed}`,
    );
    return this.locationsService.updateStoreStatus(
      squareLocationId,
      body.closed,
    );
  }

  @Admin()
  @Get("categories")
  getCategories(
    @Query("locationId") locationId: string,
  ): Promise<CategoryAdmin[]> {
    this.logger.log(`getCategories locationId=${locationId}`);
    return this.categoriesService.findAllForAdmin(locationId);
  }

  @Admin()
  @Post("categories")
  createCategory(
    @Body() body: CreateCategoryAdminDto,
  ): Promise<CategoryAdmin> {
    this.logger.log(`createCategory locationId=${body.location_id}`);
    return this.categoriesService.createForAdmin(body);
  }

  @Admin()
  @Patch("categories/:id")
  updateCategory(
    @Param("id") id: string,
    @Body() body: UpdateCategoryAdminDto,
  ): Promise<CategoryAdmin> {
    this.logger.log(`updateCategory id=${id}`);
    return this.categoriesService.updateForAdmin(id, body);
  }

  @Admin()
  @Put("locations/:squareLocationId/opening-hours")
  updateOpeningHours(
    @Param("squareLocationId") squareLocationId: string,
    @Body() body: UpdateOpeningHoursListDto,
  ): Promise<LocationEntity> {
    this.logger.log(
      `updateOpeningHours squareLocationId=${squareLocationId}`,
    );
    return this.locationsService.replaceOpeningHours(
      squareLocationId,
      body.opening_hours,
    );
  }

  @Admin()
  @Put("locations/:squareLocationId/delivery-opening-hours")
  updateDeliveryOpeningHours(
    @Param("squareLocationId") squareLocationId: string,
    @Body() body: UpdateOpeningHoursListDto,
  ): Promise<LocationEntity> {
    this.logger.log(
      `updateDeliveryOpeningHours squareLocationId=${squareLocationId}`,
    );
    return this.locationsService.replaceDeliveryOpeningHours(
      squareLocationId,
      body.opening_hours,
    );
  }

  @Admin()
  @Get("tiers")
  listTiers() {
    this.logger.log("listTiers start");
    return this.rewardsAdminService.listTiers();
  }

  @Admin()
  @Get("housemates")
  listHousemates() {
    this.logger.log("listHousemates start");
    return this.rewardsAdminService.listHousemates();
  }

  @Admin()
  @Get("rewards")
  listRewards() {
    this.logger.log("listRewards start");
    return this.rewardsAdminService.listRewards();
  }

  @Admin()
  @Get("rewards/:rewardId")
  getReward(@Param("rewardId") rewardId: string) {
    this.logger.log(`getReward rewardId=${rewardId}`);
    return this.rewardsAdminService.getReward(rewardId);
  }

  @Admin()
  @Post("rewards")
  createReward(@Body() body: CreateRewardDto) {
    this.logger.log("createReward start");
    return this.rewardsAdminService.createReward(body);
  }

  @Admin()
  @Put("rewards/:rewardId")
  updateReward(
    @Param("rewardId") rewardId: string,
    @Body() body: CreateRewardDto,
  ) {
    this.logger.log(`updateReward rewardId=${rewardId}`);
    return this.rewardsAdminService.updateReward(rewardId, body);
  }

  @Admin()
  @Delete("rewards/:rewardId")
  async deleteReward(@Param("rewardId") rewardId: string): Promise<void> {
    this.logger.log(`deleteReward rewardId=${rewardId}`);
    await this.rewardsAdminService.deleteReward(rewardId);
  }

  @Admin()
  @Get("coupons")
  listCoupons(): Promise<CouponEntity[]> {
    this.logger.log("listCoupons start");
    return this.couponService.findAll();
  }

  @Admin()
  @Post("coupons")
  createCoupon(@Body() body: CouponDto): Promise<CouponResponse> {
    this.logger.log(`createCoupon code=${body.code}`);
    return this.couponService.create({
      code: body.code,
      type: body.type,
      remainingUsages: body.remainingUsages ?? 1,
      discount: body.discount,
      amount: body.amount,
      expirationDate: body.expirationDate,
      customerPhoneNumber: body.customerPhoneNumber,
    });
  }

  @Admin()
  @Delete("coupons/:code")
  deleteCoupon(@Param("code") code: string): Promise<CouponResponse> {
    this.logger.log(`deleteCoupon code=${code}`);
    return this.couponService.remove(code);
  }
}
