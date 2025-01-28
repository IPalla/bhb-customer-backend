import { Body, Controller, Logger, Post } from "@nestjs/common";
import { OtpService } from "../service/otp.service";
import { GenerateOtpDto } from "../dto/generate-otp.dto";
import { JwtToken } from "src/model/jwtToken";
import { ValidateOtpDto } from "src/dto/validate-otp.dto";
import { Public } from "../decorators/public.decorator";

@Controller("bhb-customer-backend/otp")
@Public()
export class OtpController {
  private readonly logger = new Logger(OtpController.name);

  constructor(private readonly otpService: OtpService) {}

  @Post()
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto): Promise<any> {
    this.logger.log(
      `Generating OTP for phone number: ${generateOtpDto.phoneNumber}`,
    );
    const otp = await this.otpService.generateAndSendOtp(
      generateOtpDto.phoneNumber,
    );
    this.logger.log(`OTP generated: ${otp}`);
    return {};
  }

  @Post("validate")
  async validateOtp(@Body() validateOtpDto: ValidateOtpDto): Promise<JwtToken> {
    this.logger.log(
      `Validating OTP for phone number: ${validateOtpDto.phoneNumber}`,
    );
    const token = await this.otpService.validateOtp(
      validateOtpDto.phoneNumber,
      validateOtpDto.code,
    );
    return { token };
  }
}
