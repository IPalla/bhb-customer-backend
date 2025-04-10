import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Order } from "src/model/order";
import { firstValueFrom } from "rxjs";
import { Status } from "src/model/status";

/**
 * Interface representing an order in the delivery manager system
 */
interface DeliveryManagerOrder {
  id: string;
  externalId: string;
  date: string;
  type: string;
  channel: string;
  amount: number;
  notes?: string;
  customer: {
    name: string;
    address: string;
    phone_number: string;
  };
  statuses: Array<{
    status: string;
    createdBy: string;
    createdAtTs: number;
  }>;
  items: Array<{
    name: string;
    plu: string;
    price: number;
    quantity: number;
    subItems: Array<{
      name: string;
      plu: string;
      quantity: number;
    }>;
  }>;
}

@Injectable()
export class DeliveryManagerService {
  private readonly logger = new Logger(DeliveryManagerService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("deliveryManager.baseUrl");
    this.logger.log(
      `DeliveryManagerService initialized with baseUrl: ${this.baseUrl}`,
    );
  }

  /**
   * Creates a new order in the delivery manager system
   * @param order The order to create
   * @returns The created order
   */
  async createOrder(order: Order): Promise<void> {
    this.logger.log(`Creating order in delivery manager: ${order.id}`);
    this.logger.log(
      `Order: ${JSON.stringify(this.orderToDeliveryManagerOrder(order))}`,
    );
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ order: Order }>(
          `${this.baseUrl}/orders`,
          this.orderToDeliveryManagerOrder(order),
        ),
      );

      this.logger.log(
        `Order created successfully in delivery manager: ${order.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error creating order in delivery manager: ${error.message}`,
        {
          error,
          orderId: order.id,
        },
      );
    }
  }

  /**
   * Updates an order's status in the delivery manager system
   * @param orderId The ID of the order to update
   * @param status The new status to set
   * @returns The updated order
   */
  async updateOrder(orderId: string, status: Status): Promise<Order> {
    this.logger.log(
      `Updating order in delivery manager: ${orderId}, status: ${status.status}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.patch<{ order: Order }>(
          `${this.baseUrl}/orders/${orderId}`,
          { status },
        ),
      );

      this.logger.log(
        `Order updated successfully in delivery manager: ${orderId}`,
      );
      return response.data.order;
    } catch (error) {
      this.logger.error(
        `Error updating order in delivery manager: ${error.message}`,
        {
          error,
          orderId,
          status: status.status,
        },
      );
      throw error;
    }
  }

  orderToDeliveryManagerOrder(order: Order): DeliveryManagerOrder {
    const status = {
      status: order.status.status,
      createdBy: "Square",
      createdAtTs: Date.now(),
    };
    const statuses = [status];
    return {
      id: order.id,
      externalId: order.id,
      date: order.date,
      type: order.type,
      channel: "Web",
      amount: order.amount,
      notes: order.notes,
      customer: {
        name: order.customer.firstName,
        address:
          order.customer.address.address_line_1 +
          " " +
          order.customer.address.address_line_2,
        phone_number: order.customer.phoneNumber,
      },
      statuses: statuses,
      items: order?.products?.map((product) => ({
        name: product.name,
        plu: product.catalogId,
        price: product.price,
        quantity: product.quantity,
        subItems: product?.modifiers?.map((modifier) => ({
          name: modifier.name,
          plu: modifier.id,
          quantity: modifier.quantity,
        })),
      })),
    };
  }
}
