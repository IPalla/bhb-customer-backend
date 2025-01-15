import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: Twilio;
  private readonly verifyServiceSid: string;
  private readonly isActive: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.isActive = this.configService.get<boolean>('twilio.isActive');
    this.verifyServiceSid = this.configService.get<string>('twilio.verifyServiceSid');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendOtp(phoneNumber: string, otpCode: string): Promise<void> {
    if (!this.isActive) {
      this.logger.log(`Twilio is not active, skipping OTP send for ${phoneNumber}`);
      return;
    }
    this.logger.log(`Attempting to send OTP to ${phoneNumber}`);
    try {
      await this.twilioClient.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms'
        });
      this.logger.log(`Verification request sent successfully to ${phoneNumber}`);
    } catch (verifyError) {
      this.logger.error(`Failed to send verification to ${phoneNumber}: ${verifyError.message}`);
      throw verifyError;
    }
  }
}
