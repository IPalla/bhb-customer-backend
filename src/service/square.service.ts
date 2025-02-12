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
  TerminalCheckout,
  Order,
  Money,
} from "square";
import { randomUUID } from "crypto";
import { serializeWithBigInt } from "src/util/utils";
import { Customer } from "src/model/customer";
import { countryToIsoCode } from "./mappers/square.mapper";

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

  async getProducts(locationId: string): Promise<CatalogObject[]> {
    this.logger.log(
      `Retrieving products from Square for location: ${locationId}`,
    );
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
      console.log(serializeWithBigInt(order));
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

  async getCustomerById(customerId: string): Promise<Customer | undefined> {
    this.logger.log(`Finding customer with ID: ${customerId}`);
    try {
      const { result } =
        await this.client.customersApi.retrieveCustomer(customerId);
      this.logger.debug(
        `Customer found in Square: ${serializeWithBigInt(result)}`,
      );
      return result.customer;
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
            addressLine1: customer.address?.address_line_1,
            addressLine2: customer.address?.address_line_2,
            locality: customer.address?.locality,
            postalCode: customer.address?.postalCode,
            country: countryToIsoCode[customer.address?.country],
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

  async createTerminalCheckout(
    orderId: string,
    amount: bigint,
    currency: string,
    deviceId: string
  ): Promise<TerminalCheckout> {
    try {
      this.logger.log(
        `Creating terminal checkout in square for order: ${orderId}, with amount: ${amount}, currency: ${currency}, deviceId: ${deviceId} `,
      );
      const checkout = await this.client.terminalApi.createTerminalCheckout({
        idempotencyKey: randomUUID(),
        checkout: {
          referenceId: orderId,
          amountMoney: {
            amount: amount,
            currency: currency,
          },
          deviceOptions: {
            skipReceiptScreen: true,
            deviceId,
          },
        },
      });
      return checkout.result.checkout;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error during terminal checkout:", error);
        throw error;
      }
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const { result } = await this.client.ordersApi.retrieveOrder(orderId);
      return result.order;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error retrieving order:", error);
        throw error;
      }
    }
  }

  async printReceipt(paymentId: string, deviceId: string): Promise<any> {
    this.logger.log(`Printing receipt for payment: ${paymentId}`);
    try {
      const { result } = await this.client.terminalApi.createTerminalAction({
        idempotencyKey: randomUUID(),
        action: {
          type: "RECEIPT",
          deviceId,
          receiptOptions: {
            paymentId,
          },

        },
      });
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error during receipt printing:", error);
        throw error;
      }
    }
  }

  async createExternalPayment(orderId: string, amount: bigint, currency: string, customerId?: string): Promise<any> {
    this.logger.log(`Creating external payment for order: ${orderId}, amount: ${amount}, currency: ${currency}, customerId: ${customerId}`);
    try {
      const { result } = await this.client.paymentsApi.createPayment({
        sourceId: "EXTERNAL",
        autocomplete: true,
        customerId: customerId || undefined,
        referenceId: orderId,
        orderId: orderId,
        amountMoney: {
          amount: amount,
          currency: currency,
        },
        idempotencyKey: randomUUID(),
        externalDetails: {
          type: "EXTERNAL",
          source: "kiosk",
          sourceFeeMoney: {
            amount: amount,
            currency: currency,
          },
        },
      });
      this.logger.log(`External payment created for order: ${orderId}, amount: ${amount}, currency: ${currency}, customerId: ${customerId}`);
      return result.payment.id;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error during external payment:", error);
        throw error;
      }
    }
  }

  async retrievePayment(paymentId: string): Promise<any> {
    this.logger.log(`Retrieving payment with ID: ${paymentId}`);
    try {
      const { result } = await this.client.paymentsApi.getPayment(paymentId);
      return result.payment;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.error("Square API Error:", error.errors);
        throw error;
      } else {
        this.logger.error("Unexpected error retrieving payment:", error);
        throw error;
      }
    }
  }
}
