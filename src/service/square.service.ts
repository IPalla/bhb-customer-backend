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
  Payment,
} from "square";
import { randomUUID } from "crypto";
import { serializeWithBigInt } from "src/util/utils";
import { Customer } from "src/model/customer";
import { countryToIsoCode } from "./mappers/square.mapper";
import { SquareServiceError } from "../errors/square-service.error";

@Injectable()
export class SquareService {
  private readonly logger = new Logger(SquareService.name);
  private readonly client: Client;
  private readonly locationIds: string[];

  constructor(private readonly configService: ConfigService) {
    this.client = this.initializeSquareClient();
    this.locationIds = this.configService.getOrThrow("square.locationIds");
  }

  private initializeSquareClient(): Client {
    return new Client({
      bearerAuthCredentials: {
        accessToken: this.configService.getOrThrow("square.accessToken"),
      },
      environment: this.configService.getOrThrow("square.isSandbox")
        ? Environment.Sandbox
        : Environment.Production,
    });
  }

  private handleSquareError(error: unknown, operation: string): never {
    if (error instanceof ApiError) {
      this.logger.error(`Square API Error during ${operation}:`, error.errors);
      throw new SquareServiceError(`Failed to ${operation}`, error.errors);
    }
    this.logger.error(`Unexpected error during ${operation}:`, error);
    throw new SquareServiceError(`Unexpected error during ${operation}`, error);
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
      this.handleSquareError(error, "retrieving products");
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
      this.handleSquareError(error, "creating payment");
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
      this.handleSquareError(error, "creating order");
    }
  }

  async findCustomerByPhone(
    phoneNumber: string,
  ): Promise<Customer | undefined> {
    try {
      const { result } = await this.client.customersApi.searchCustomers({
        query: {
          filter: {
            phoneNumber: { exact: phoneNumber },
          },
        },
      });

      this.logger.debug(
        `Customer search result: ${serializeWithBigInt(result)}`,
      );
      return result.customers?.[0];
    } catch (error) {
      this.handleSquareError(error, "finding customer by phone");
    }
  }

  async getCustomerById(customerId: string): Promise<Customer | undefined> {
    try {
      const { result } =
        await this.client.customersApi.retrieveCustomer(customerId);
      this.logger.debug(`Retrieved customer: ${serializeWithBigInt(result)}`);
      return result.customer;
    } catch (error) {
      this.handleSquareError(error, "retrieving customer by ID");
    }
  }

  async createCustomer(phoneNumber: string): Promise<Customer> {
    try {
      const { result } = await this.client.customersApi.createCustomer({
        phoneNumber,
      });
      return result.customer;
    } catch (error) {
      this.handleSquareError(error, "creating customer");
    }
  }

  async updateCustomer(customer: Customer): Promise<SquareCustomer> {
    try {
      const { result } = await this.client.customersApi.updateCustomer(
        customer.id,
        {
          givenName: customer.firstName,
          familyName: customer.lastName,
          emailAddress: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address && {
            addressLine1: customer.address.address_line_1,
            addressLine2: customer.address.address_line_2,
            locality: customer.address.locality,
            postalCode: customer.address.postalCode,
            country: countryToIsoCode[customer.address.country],
          },
        },
      );
      return result.customer;
    } catch (error) {
      this.handleSquareError(error, "updating customer");
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
      this.handleSquareError(error, "fetching customer orders");
    }
  }

  async createTerminalCheckout(
    orderId: string,
    amount: bigint,
    currency: string,
    deviceId: string,
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
      this.handleSquareError(error, "creating terminal checkout");
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const { result } = await this.client.ordersApi.retrieveOrder(orderId);
      return result.order;
    } catch (error) {
      this.handleSquareError(error, "retrieving order");
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
      this.handleSquareError(error, "printing receipt");
    }
  }

  async createExternalPayment(
    orderId: string,
    amount: bigint,
    currency: string,
    customerId?: string,
  ): Promise<string> {
    try {
      const { result } = await this.client.paymentsApi.createPayment({
        sourceId: "EXTERNAL",
        autocomplete: true,
        customerId: customerId,
        referenceId: orderId,
        orderId: orderId,
        amountMoney: {
          amount,
          currency,
        },
        idempotencyKey: randomUUID(),
        externalDetails: {
          type: "EXTERNAL",
          source: "kiosk",
          sourceFeeMoney: {
            amount,
            currency,
          },
        },
      });

      this.logger.log(
        `External payment created successfully for order: ${orderId}`,
      );
      return result.payment.id;
    } catch (error) {
      this.handleSquareError(error, "creating external payment");
    }
  }

  async retrievePayment(paymentId: string): Promise<Payment> {
    try {
      const { result } = await this.client.paymentsApi.getPayment(paymentId);
      return result.payment;
    } catch (error) {
      this.handleSquareError(error, "retrieving payment");
    }
  }
}
