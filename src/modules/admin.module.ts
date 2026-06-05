import { Module } from "@nestjs/common";
import { AdminController } from "src/controller/admin.controller";
import { CategoriesModule } from "./categories.module";
import { LocationsModule } from "./locations.module";
import { CouponModule } from "./coupon.module";
import { RewardsAdminService } from "src/service/rewards-admin.service";
@Module({
  imports: [LocationsModule, CategoriesModule, CouponModule],
  controllers: [AdminController],
  providers: [RewardsAdminService],
})
export class AdminModule {}
