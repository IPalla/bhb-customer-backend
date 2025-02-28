import { ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { OtpEntity } from "../entity/otp.entity";
import { InjectModel } from "@nestjs/sequelize";
import { TwilioService } from "./twilio.service";
import { JwtService } from "@nestjs/jwt";
import { Op } from "sequelize";
import { CustomersService } from "./customers.service";
import { ConfigService } from "@nestjs/config";

interface OtpResponse {
  success: boolean;
  message?: string;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly guestApiKey: string;
  private readonly OTP_EXPIRY_MINUTES = 1;
  private readonly OTP_LENGTH = 6;

  constructor(
    @InjectModel(OtpEntity)
    private readonly otpModel: typeof OtpEntity,
    private readonly twilioService: TwilioService,
    private readonly jwtService: JwtService,
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
  ) {
    this.guestApiKey = this.configService.get("guestApiKey");
  }

  async generateAndSendOtp(phoneNumber: string): Promise<OtpResponse> {
    try {
      const otp = this.generateOtpCode();
      const expiryDate = this.calculateExpiryDate();

      await this.otpModel.create({
        phoneNumber,
        code: otp,
        expiryDate,
      });

      await this.twilioService.sendOtp(phoneNumber, otp);

      this.logger.log(`OTP generated and sent for ${phoneNumber} - ${otp}`);
      return {
        success: true,
        message: "OTP sent successfully",
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate/send OTP for ${phoneNumber}:`,
        error,
      );
      return {
        success: false,
        message: "Failed to send OTP",
      };
    }
  }

  private generateOtpCode(): string {
    if (process.env.NODE_ENV === "development") {
      return "123456";
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private calculateExpiryDate(): Date {
    return new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
  }

  async validateOtp(phoneNumber: string, code: string): Promise<string> {
    this.logger.log(`Validating OTP for phone number: ${phoneNumber}`);

    const otp = await this.findValidOtp(phoneNumber, code);

    if (!otp) {
      throw new ConflictException("Invalid or expired OTP");
    }

    await otp.destroy();

    const customer =
      await this.customersService.findOrCreateByPhone(phoneNumber);
    return this.jwtService.sign({ customer });
  }

  private async findValidOtp(
    phoneNumber: string,
    code: string,
  ): Promise<OtpEntity | null> {
    return this.otpModel.findOne({
      where: {
        phoneNumber,
        code,
        expiryDate: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  async generateGuestJwt(apiKey: string): Promise<string> {
    // Generate JWT with 30 minute expiration
    if (apiKey !== this.guestApiKey) {
      throw new UnauthorizedException("Invalid API key");
    }
    const expiresIn = "30m";
    return this.jwtService.sign({ customer: null }, { expiresIn });
  }
}
