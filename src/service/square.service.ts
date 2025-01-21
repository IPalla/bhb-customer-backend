import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  Client,
  Environment,
  ApiError,
  CatalogObject,
  CreateOrderRequest,
  CreateOrderResponse,
  Customer as SquareCustomer,
  SearchOrdersResponse,
  Order,
} from "square";
import { randomUUID } from "crypto";
import { serializeWithBigInt } from "src/util/utils";
import { Customer } from "src/model/customer";

@Injectable()
export class SquareService {
  private readonly logger = new Logger(SquareService.name);
  private client: Client;
  private locationIds: string[];
  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      bearerAuthCredentials: {
        accessToken: this.configService.getOrThrow("square.accessToken"),
      },
      environment: this.configService.getOrThrow("square.isSandbox")
        ? Environment.Sandbox
        : Environment.Production,
    });
    this.locationIds = this.configService.getOrThrow("square.locationIds");
  }

  async getProducts(): Promise<CatalogObject[]> {
    this.logger.log("Retrieving products from Square");
    try {
      const response = await this.client.catalogApi.listCatalog(
        undefined,
        "ITEM,IMAGE,MODIFIER_LIST,CATEGORY",
      );
      return response.result.objects;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Errors returned by the API: ", error.errors);
      } else {
        console.error("Unexpected error: ", error);
      }
    }
  }

  async createPayment(sourceId: string, orderId: any): Promise<any> {
    try {
      const { result } = await this.client.ordersApi.retrieveOrder(orderId);
      const payment = await this.client.paymentsApi.createPayment({
        sourceId: sourceId,
        orderId: orderId,
        idempotencyKey: randomUUID(),
        amountMoney: {
          amount: result.order.totalMoney.amount,
          currency: "EUR",
        },
      });
      return payment.result;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error during payment creation:", error);
        throw error;
      }
    }
  }

  async createOrder(order: CreateOrderRequest): Promise<CreateOrderResponse> {
    this.logger.log("Creating order in Square");
    try {
      const { result } = await this.client.ordersApi.createOrder(order);
      this.logger.log("Order created in Square");
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error during order creation:", error);
        throw error;
      }
    }
  }

  async findCustomerByPhone(
    phoneNumber: string,
  ): Promise<Customer | undefined> {
    this.logger.log(`Finding customer with phone number: ${phoneNumber}`);
    try {
      const { result } = await this.client.customersApi.searchCustomers({
        query: {
          filter: {
            phoneNumber: {
              exact: phoneNumber,
            },
          },
        },
      });
      this.logger.debug(
        `Customer found in Square: ${serializeWithBigInt(result)}`,
      );
      if (!result.customers?.length) {
        return undefined;
      }
      return result.customers[0];
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        return undefined;
      } else {
        this.logger.error("Unexpected error while finding customer:", error);
        return undefined;
      }
    }
  }

  async createCustomer(phoneNumber: string): Promise<Customer> {
    this.logger.log(`Creating customer with phone number: ${phoneNumber}`);
    try {
      const { result } = await this.client.customersApi.createCustomer({
        phoneNumber,
      });
      return result.customer;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      }
      this.logger.error("Unexpected error creating customer:", error);
      throw error;
    }
  }

  async updateCustomer(customer: Customer): Promise<SquareCustomer> {
    this.logger.log(`Updating customer with ID: ${customer.id}`);
    try {
      const { result } = await this.client.customersApi.updateCustomer(
        customer.id,
        {
          givenName: customer.firstName,
          familyName: customer.lastName,
          emailAddress: customer.email,
          phoneNumber: customer.phoneNumber,
          address: {
            addressLine1: customer.address?.street,
            locality: "Tres Cantos",
            postalCode: "28760",
            country: "ES",
          },
        },
      );
      return result.customer;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      }
      this.logger.error("Unexpected error updating customer:", error);
      throw error;
    }
  }

  async getCustomerOrders(customerId: string): Promise<any[]> {
    this.logger.log(`Fetching orders for customer: ${customerId}`);
    try {
      const { result } = await this.client.ordersApi.searchOrders({
        locationIds: this.locationIds,
        query: {
          filter: {
            customerFilter: {
              customerIds: [customerId],
            },
          },
          sort: {
            sortField: "CREATED_AT",
            sortOrder: "DESC",
          },
        },
      });

      return result.orders || [];
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error(
          "Unexpected error while fetching customer orders:",
          error,
        );
        throw error;
      }
    }
  }
}
