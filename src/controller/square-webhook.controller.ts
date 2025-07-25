import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  Headers,
} from "@nestjs/common";
import { SquareWebhookEventDto } from "../dto/square-webhook-event.dto";
import { Public } from "src/decorators/public.decorator";
import { OrdersService } from "src/service/orders.service";
import { WebhookService } from "src/service/webhook.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller("bhb-customer-backend/square-webhook")
export class SquareWebhookController {
  private readonly logger = new Logger(SquareWebhookController.name);
  private readonly SIGNATURE_KEY = "015gmO5Te9BNZ_NsovFUnw"; //process.env.SQUARE_SIGNATURE_KEY;
  private readonly NOTIFICATION_URL =
    "https://9d58-2a0c-5a86-4d02-4200-6d57-a76a-ee2e-7aa5.ngrok-free.app/bhb-customer-backend/square-webhook";

  constructor(
    private readonly ordersService: OrdersService,
    private readonly webhookService: WebhookService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @Public()
  @HttpCode(204)
  async handleWebhook(
    @Body() event: SquareWebhookEventDto,
    @Headers("x-square-hmacsha256-signature") signature: string,
  ): Promise<void> {
    this.logger.log(
      `Received Square webhook event: ${event.type} with ID: ${event.event_id}`,
    );

    switch (event.type) {
      case "terminal.checkout.updated":
        this.handleTerminalCheckoutUpdated(event);
        break;
      case "order.fulfillment.updated":
        this.handleOrderFulfillmentUpdated(event);
        break;
      case "order.updated":
        this.handleOrderUpdated(event);
        break;
      case "payment.created":
        await this.handlePaymentCreated(event);
        break;
      default:
        break;
    }

    /*WebhooksHelper.isWebhookEeventSignature(
      event,
      signature,
      SIGNATURE_KEY,
      NOTIFICATION_URL
    )*/
    return;
  }

  private handleTerminalCheckoutUpdated(event: SquareWebhookEventDto): void {
    this.logger.log(
      `Received terminal checkout updated event. Checkout ID: ${event.data?.id}`,
    );
    this.ordersService.handleWebhookPayment(
      event.data.object.checkout.status,
      event.data.id,
    );
  }

  private handleOrderFulfillmentUpdated(event: SquareWebhookEventDto): void {
    if (
      event.data.object.order_fulfillment_updated.fulfillment_update[0]
        .new_state === "PREPARED"
    ) {
      this.logger.log(`Received order updated event.`);
      this.webhookService.handleOrderPreparedWebhook(event);
    }
  }

  private handleOrderUpdated(event: SquareWebhookEventDto): void {
    if (event?.data?.object?.order_updated?.state === "OPEN") {
      this.logger.log(`Received order created event.`);
      // Delegate to the webhook service (no-op)
    }
  }

  private async handlePaymentCreated(event: SquareWebhookEventDto): Promise<void> {
    if (event?.data?.object?.payment?.status === "APPROVED") {
      this.logger.log(
        `Received payment created event with ID: ${event.event_id}`,
      );
      try {
        const isDuplicatedPaymentForKiosk =
          event.data?.object?.payment?.application_details?.square_product !==
          "ECOMMERCE_API";
        if (isDuplicatedPaymentForKiosk) {
          this.logger.log(`Duplicated payment for kiosk. Skipping...`);
          return;
        }
        const orderId = event?.data?.object?.payment?.order_id;
        if (orderId) {
          this.eventEmitter.emit("order.created", orderId);
        }
      } catch (error) {
        this.logger.error(`Error processing payment webhook: ${error}`);
      }
    }
  }
}
