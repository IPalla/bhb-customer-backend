import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CouponEntity, CouponType } from "../entity/coupon.entity";
import { CouponDto } from "../dto/coupon.dto";

interface CouponResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    @InjectModel(CouponEntity)
    private readonly couponModel: typeof CouponEntity,
  ) {}

  async create(couponDto: CouponDto): Promise<CouponResponse> {
    try {
      if (!couponDto.code) {
        throw new ConflictException("Coupon code is required");
      }

      if (!couponDto.type) {
        throw new ConflictException("Coupon type is required");
      }

      if (!couponDto.expirationDate) {
        throw new ConflictException("Expiration date is required");
      }

      // Check if coupon code already exists
      const existingCoupon = await this.couponModel.findOne({
        where: { code: couponDto.code },
      });

      if (existingCoupon) {
        throw new ConflictException(
          `Coupon with code ${couponDto.code} already exists`,
        );
      }

      const coupon = await this.couponModel.create({
        code: couponDto.code.toUpperCase(),
        used: couponDto.used || false,
        type: couponDto.type,
        discount: couponDto.discount,
        amount: couponDto.amount,
        expirationDate: new Date(couponDto.expirationDate),
        customerPhoneNumber: couponDto.customerPhoneNumber,
      });

      this.logger.log(`Coupon created with code: ${coupon.code}`);
      return {
        success: true,
        message: "Coupon created successfully",
        data: coupon,
      };
    } catch (error) {
      this.logger.error(`Failed to create coupon:`, error);
      throw error;
    }
  }

  async findAll(): Promise<CouponEntity[]> {
    try {
      return await this.couponModel.findAll();
    } catch (error) {
      this.logger.error(`Failed to fetch coupons:`, error);
      throw error;
    }
  }

  async findOne(id: number): Promise<CouponEntity> {
    try {
      const coupon = await this.couponModel.findByPk(id);

      if (!coupon) {
        throw new NotFoundException(`Coupon with ID ${id} not found`);
      }

      return coupon;
    } catch (error) {
      this.logger.error(`Failed to fetch coupon:`, error);
      throw error;
    }
  }

  async findByCodeAndCustomer(
    code: string,
    customerPhoneNumber: string,
  ): Promise<CouponEntity> {
    try {
      const coupon = await this.couponModel.findOne({
        where: { code, customerPhoneNumber },
      });

      if (!coupon) {
        throw new NotFoundException(
          `Coupon with code ${code} and customer phone number ${customerPhoneNumber} not found`,
        );
      }

      return coupon;
    } catch (error) {
      this.logger.error(`Failed to fetch coupon by code:`, error);
      throw error;
    }
  }

  async update(id: number, couponDto: CouponDto): Promise<CouponResponse> {
    try {
      const coupon = await this.findOne(id);

      if (couponDto.code && couponDto.code !== coupon.code) {
        // Check if new code exists
        const existingCoupon = await this.couponModel.findOne({
          where: { code: couponDto.code },
        });

        if (existingCoupon) {
          throw new ConflictException(
            `Coupon with code ${couponDto.code} already exists`,
          );
        }
      }

      // Update coupon properties
      if (couponDto.code !== undefined) coupon.code = couponDto.code;
      if (couponDto.used !== undefined) coupon.used = couponDto.used;
      if (couponDto.type !== undefined) coupon.type = couponDto.type;
      if (couponDto.discount !== undefined)
        coupon.discount = couponDto.discount;
      if (couponDto.amount !== undefined) coupon.amount = couponDto.amount;
      if (couponDto.expirationDate !== undefined) {
        coupon.expirationDate = new Date(couponDto.expirationDate);
      }
      if (couponDto.customerPhoneNumber !== undefined) {
        coupon.customerPhoneNumber = couponDto.customerPhoneNumber;
      }

      await coupon.save();

      this.logger.log(`Coupon updated with ID: ${id}`);
      return {
        success: true,
        message: "Coupon updated successfully",
        data: coupon,
      };
    } catch (error) {
      this.logger.error(`Failed to update coupon:`, error);
      throw error;
    }
  }

  async updateAsUsed(
    code: string,
    customerPhoneNumber: string,
  ): Promise<CouponResponse> {
    try {
      const coupon = await this.findByCodeAndCustomer(
        code,
        customerPhoneNumber,
      );
      coupon.used = true;
      await coupon.save();
      return {
        success: true,
        message: "Coupon updated as used successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to update coupon as used:`, error);
      throw error;
    }
  }

  async remove(id: number): Promise<CouponResponse> {
    try {
      const coupon = await this.findOne(id);
      await coupon.destroy();

      this.logger.log(`Coupon deleted with ID: ${id}`);
      return {
        success: true,
        message: "Coupon deleted successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to delete coupon:`, error);
      throw error;
    }
  }
}
