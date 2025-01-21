import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { OtpEntity } from "../entity/otp.entity";
import { InjectModel } from "@nestjs/sequelize";
import { TwilioService } from "./twilio.service";
import { JwtService } from "@nestjs/jwt";
import { Op } from "sequelize";
import { CustomersService } from "./customers.service";

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(OtpEntity)
    private readonly otpModel: typeof OtpEntity,
    private readonly twilioService: TwilioService,
    private readonly jwtService: JwtService,
    private readonly customersService: CustomersService,
  ) {}

  async generateAndSendOtp(phoneNumber: string): Promise<any> {
    const otp = this.generateOtpCode();
    const expiryDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await this.otpModel.create({
      phoneNumber,
      code: otp,
      expiryDate,
    });
    this.logger.log(`Would send SMS to ${phoneNumber} with code: ${otp}`);
    this.twilioService.sendOtp(phoneNumber, otp);
    this.logger.log(`OTP generated for ${phoneNumber}: ${otp}`);
    return { otp };
  }

  private generateOtpCode(): string {
    return "123456";
    //return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async validateOtp(phoneNumber: string, code: string): Promise<string> {
    this.logger.log(
      `Validating OTP for phone number: ${phoneNumber} with code: ${code}`,
    );
    const otp = await this.otpModel.findOne({
      where: {
        phoneNumber,
        code,
        expiryDate: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!otp) {
      throw new UnauthorizedException("Invalid or expired OTP");
    }
    // Delete the used OTP
    await otp.destroy();
    const customer =
      await this.customersService.findOrCreateByPhone(phoneNumber);
    // Generate JWT
    return this.jwtService.sign({ customer });
  }
}
