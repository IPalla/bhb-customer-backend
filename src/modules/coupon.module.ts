import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CouponController } from "../controller/coupon.controller";
import { CouponService } from "../service/coupon.service";
import { CouponEntity } from "../entity/coupon.entity";

@Module({
  imports: [SequelizeModule.forFeature([CouponEntity])],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
