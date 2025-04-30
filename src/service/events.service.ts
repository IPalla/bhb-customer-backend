import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SquareService } from "./square.service";
import { SquareMapper } from "./mappers/square.mapper";
import { DeliveryManagerService } from "./delivery-manager.service";
import { CouponService } from "./coupon.service";
import { Order } from "src/model/order";

const UNSUPPORTED_PLATFORMS = ['just eat', 'glovo', 'uber eats'];

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper,
    private readonly deliveryManagerService: DeliveryManagerService,
    private readonly couponService: CouponService,
  ) {}

  @OnEvent("order.created")
  async handleOrderCreatedWebhook(orderId: string): Promise<void> {
    this.logger.log(`Handling order created event for Order ID: ${orderId}`);

    try {
      // Get order details from Square
      const squareOrder = await this.squareService.getOrder(orderId);
      if (!squareOrder) {
        this.logger.warn(`Order not found in Square: ${orderId}`);
        return;
      }
      
      const sourceName = squareOrder.source.name?.toLowerCase() || '';
      if (UNSUPPORTED_PLATFORMS.includes(sourceName)) {
        this.logger.warn(`Order is from unsupported platform (${squareOrder.source.name}): ${orderId}`);
        return;
      }
      
      // Map Square order to our Order model
      const order = this.squareMapper.squareOrderToOrder(squareOrder);

      // Ensure customer object exists and details are not undefined
      if (!order.customer) {
        order.customer = {};
      }
      order.customer.firstName = order.customer.firstName || "Invitado";
      order.customer.lastName = order.customer.lastName || "";
      order.customer.email = order.customer.email || "";
      order.customer.phoneNumber = order.customer.phoneNumber || "";
      
      this.logger.log(
        `Order details - Type: ${order.type}, Amount: ${order.amount}, Scheduled: ${order.scheduled}`,
      );
      if (order.coupon) {
        this.logger.log(`Coupon used: ${order.coupon.code}`);
        this.couponService.useCoupon(
          order.coupon.code,
          order.customer.phoneNumber,
        );
      }
      // Create order in delivery manager system
      try {
        await this.deliveryManagerService.createOrder(order);
        this.logger.log(
          `Order created successfully in delivery manager from webhook: ${order.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create order in delivery manager from webhook: ${error.message}`,
          {
            orderId: order.id,
            error,
          },
        );
      }

      this.logger.log(
        `Order created webhook processed successfully: ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing order created webhook: ${error.message}`,
        {
          error,
          orderId,
        },
      );
      throw error;
    }
  }
}

