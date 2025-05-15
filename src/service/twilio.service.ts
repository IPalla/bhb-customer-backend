import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Twilio } from "twilio";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  verifyServiceSid: string;
  isActive: boolean;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly twilioClient: Twilio;
  private readonly config: TwilioConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.loadConfig();
    this.twilioClient = new Twilio(
      this.config.accountSid,
      this.config.authToken,
    );
  }

  private loadConfig(): TwilioConfig {
    return {
      accountSid: this.configService.getOrThrow<string>("twilio.accountSid"),
      authToken: this.configService.getOrThrow<string>("twilio.authToken"),
      verifyServiceSid: this.configService.getOrThrow<string>(
        "twilio.verifyServiceSid",
      ),
      isActive: this.configService.get<boolean>("twilio.isActive", false),
    };
  }

  async sendOtp(phoneNumber: string, otpCode: string): Promise<void> {
    if (!this.config.isActive) {
      this.logger.log(
        `Twilio is not active, skipping OTP send for ${phoneNumber}`,
      );
      return;
    }

    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.config.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
          // Note: customCode is commented out as it might not be supported in the current Twilio plan
          customCode: otpCode,
        });

      this.logger.log(
        `Verification request sent successfully to ${phoneNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send verification to ${phoneNumber}:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
