import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { SquareService } from "./square.service";
import { SquareMapper } from "./mappers/square.mapper";
import { DeliveryManagerService } from "./delivery-manager.service";
import { CouponService } from "./coupon.service";
import { Customer } from "src/model/customer";
import { Order } from "square";

const UNSUPPORTED_PLATFORMS = ["just eat", "glovo", "uber eats"];

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
    // We should wait two seconds to ensure the order is created in Square
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      // Get order details from Square
      const squareOrder = await this.squareService.getOrder(orderId);

      const sourceName = squareOrder.source.name?.toLowerCase() || "";
      const isFromPos =
        squareOrder.source.name?.toLowerCase() === "" ||
        squareOrder.source?.name === undefined;

      if (!squareOrder) {
        this.logger.warn(`Order not found in Square: ${orderId}`);
        return;
      }

      if (UNSUPPORTED_PLATFORMS.includes(sourceName)) {
        this.logger.warn(
          `Order is not from POS (${squareOrder.source.name}): ${orderId}`,
        );
        return;
      }
      // Map Square order to our Order model
      var order = this.squareMapper.squareOrderToOrder(squareOrder, isFromPos);
      if (!order.customer || Object.keys(order.customer).length === 0) {
        const customerId = squareOrder?.customerId;
        order.customer = await this.fillCustomer(customerId, squareOrder);
      }
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

  private async fillCustomer(
    customerId: string,
    squareOrder: Order,
  ): Promise<Customer> {
    if (!customerId) {
      return {
        firstName: "Invitado",
        lastName: "",
        email: "",
        phoneNumber: "",
      };
    } else {
      this.logger.log(`Getting customer details from Square ${customerId}`);
      const squareCustomer =
        await this.squareService.getCustomerById(customerId);
      return {
        firstName:
          squareCustomer?.givenName || squareCustomer?.familyName
            ? `${squareCustomer?.givenName || ""} ${squareCustomer?.familyName || ""}`.trim()
            : squareOrder?.ticketName,
        email: squareCustomer?.emailAddress,
        phoneNumber: squareCustomer?.phoneNumber,
        address: squareCustomer?.address,
      };
    }
  }
}
