import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private origin: string;
  private token: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    if (
      !this.configService.get("whatsapp.token") ||
      !this.configService.get("whatsapp.origin")
    ) {
      throw new Error(
        "Missing configuration property: whatsapp.token or whatsapp.origin",
      );
    }
    this.origin = this.configService.get("whatsapp.origin");
    this.token = this.configService.get("whatsapp.token");
  }

  async sendOtp(otp: string, phoneNumber: string): Promise<void> {
    this.logger.log(`Sending OTP via whatsapp. Number: ${phoneNumber}`);
    // Check if the phone number is valid
    if (phoneNumber !== null && !phoneNumber.startsWith("+34")) {
      this.logger.warn(
        `Not notifying ${phoneNumber} because number is not spanish number`,
      );
      return;
    }
    phoneNumber = phoneNumber?.replace("+", "");
    // Send whatsapp to customer based on the message type
    const body = this.buildOtpBody(otp, phoneNumber);
    try {
      const response = await this.httpService.axiosRef.post(
        `https://graph.facebook.com/v15.0/${this.origin}/messages`,
        body,
        this.buildHeaders(),
      );
      this.logger.log(`Whatsapp sent. Status: ${response.status}`);
    } catch (error) {
      this.logger.error(
        `Error sending whatsapp. Status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`,
      );
    }
  }

  buildHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }

  buildOtpBody(otp: string, destination: string) {
    const template = "otp_code";
    var components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: otp,
          },
        ],
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: otp,
          },
        ],
      },
    ];
    return {
      messaging_product: "whatsapp",
      to: destination,
      type: "template",
      template: {
        name: template,
        language: {
          code: "es",
        },
        components: components,
      },
    };
  }
}
