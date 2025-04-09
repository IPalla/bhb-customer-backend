import { Injectable, Logger } from "@nestjs/common";
import { SquareWebhookEventDto } from "src/dto/square-webhook-event.dto";
import { SquareService } from "./square.service";
import { SquareMapper } from "./mappers/square.mapper";
import { DeliveryManagerService } from "./delivery-manager.service";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper,
    private readonly deliveryManagerService: DeliveryManagerService,
  ) {}

  async handleOrderUpdatedWebhook(event: SquareWebhookEventDto): Promise<void> {
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

      this.logger.log(`Square order: ${JSON.stringify(squareOrder)}`);

      // Map Square order to our Order model
      const order = this.squareMapper.squareOrderToOrder(squareOrder);

      // Log order details
      this.logger.log(`Order updated - ID: ${order.id}`);
      this.logger.log(
        `Order details - Type: ${order.type}, Amount: ${order.amount}, Scheduled: ${order.scheduled}`,
      );

      if (order.status) {
        this.logger.log(
          `Order status - Status: ${order.status.status}, Created At: ${order.status.createdAt}`,
        );

        // Update order status in delivery manager system
        try {
          await this.deliveryManagerService.updateOrder(order.id, order.status);
          this.logger.log(
            `Order status updated successfully in delivery manager from webhook: ${order.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to update order status in delivery manager from webhook: ${error.message}`,
            {
              orderId: order.id,
              status: order.status.status,
              error,
            },
          );
        }
      }

      if (order.statuses && order.statuses.length > 0) {
        this.logger.log(`Order status history:`);
        order.statuses.forEach((status, index) => {
          this.logger.log(
            `Status ${index + 1} - Status: ${status.status}, Created At: ${status.createdAt}`,
          );
        });
      }

      this.logger.log(
        `Order updated webhook processed successfully: ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing order updated webhook: ${error.message}`,
        {
          error,
          orderId,
          eventId: event.event_id,
        },
      );
    }
  }
}
