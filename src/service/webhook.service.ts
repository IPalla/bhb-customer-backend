import { Injectable, Logger } from "@nestjs/common";
import { SquareWebhookEventDto } from "src/dto/square-webhook-event.dto";
import { SquareService } from "./square.service";
import { SquareMapper } from "./mappers/square.mapper";
import { DeliveryManagerService } from "./delivery-manager.service";
import { Status } from "src/model/status";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper,
    private readonly deliveryManagerService: DeliveryManagerService,
  ) { }

  async handleOrderPreparedWebhook(event: SquareWebhookEventDto): Promise<void> {
    const orderId = event.data?.object?.order?.id || event.data?.id;
    if (!orderId) {
      this.logger.warn("Order ID not found in webhook event");
      return;
    }

    this.logger.log(
      `Handling order updated webhook for event ID: ${event.event_id}, Order ID: ${orderId}`,
    );

    try {
      // Get order details from Square
      const squareOrder = await this.squareService.getOrder(orderId);

      if (!squareOrder) {
        this.logger.warn(`Order not found in Square: ${orderId}`);
        return;
      }

      // Log order details
      this.logger.log(`Order updated - ID: ${orderId}`);

        await this.deliveryManagerService.updateOrder(orderId, Status.StatusEnum.READY);
        this.logger.log(
          `Order status updated successfully in delivery manager from webhook: ${orderId}`,
        );
    } catch (error) {
      this.logger.error(
        `Failed to update order status in delivery manager from webhook: ${error.message}`,
        {
          orderId: orderId,
          error,
        },
      );
    }
  }
}
