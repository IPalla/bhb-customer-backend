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
  Payment,
  Device,
} from "square";
import { randomUUID } from "crypto";
import { Customer } from "src/model/customer";
import { countryToIsoCode } from "./mappers/square.mapper";
import { SquareServiceError } from "../errors/square-service.error";
import { removeUndefinedProperties } from "src/util/utils";

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
      if (result.order.netAmountDueMoney.amount === BigInt(0)) {
        this.logger.log(`Processing zero amount order: ${orderId}`);
        const payOrderResult = await this.client.ordersApi.payOrder(orderId, {
          idempotencyKey: randomUUID(),
          paymentIds: [], // Empty array for zero amount orders
        });
        return payOrderResult.result;
      }
      const payment = await this.client.paymentsApi.createPayment({
        sourceId: sourceId,
        orderId: orderId,
        idempotencyKey: randomUUID(),
        amountMoney: {
          amount: result.order.netAmountDueMoney.amount,
          currency: "EUR",
        },
      });

      // Check if this is a delivery order and update fulfillment status if needed
      const hasDeliveryFulfillment = result.order.fulfillments?.some(
        (fulfillment) =>
          fulfillment.type === "DELIVERY" && fulfillment.state === "PROPOSED",
      );

      if (hasDeliveryFulfillment) {
        this.logger.log(
          `Delivery order detected. Updating fulfillment status for order: ${result.order.id}`,
        );
        //await this.updateDeliveryFulfillmentStatus(result.order.id);
      }
      return payment.result;
    } catch (error) {
      this.handleSquareError(error, "creating payment");
    }
  }

  async createOrder(order: CreateOrderRequest): Promise<CreateOrderResponse> {
    this.logger.log("Creating order in Square");
    try {
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
      return result.customers?.[0];
    } catch (error) {
      this.handleSquareError(error, "finding customer by phone");
    }
  }

  async getCustomerById(customerId: string): Promise<Customer | undefined> {
    try {
      const { result } =
        await this.client.customersApi.retrieveCustomer(customerId);
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
    const customerToUpdate = {
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
    };
    removeUndefinedProperties(customerToUpdate);
    try {
      const { result } = await this.client.customersApi.updateCustomer(
        customer.id,
        customerToUpdate,
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

  async getDevices(): Promise<Device[]> {
    this.logger.log("Retrieving devices from Square");
    try {
      const { result } = await this.client.devicesApi.listDevices();
      return result.devices;
    } catch (error) {
      this.handleSquareError(error, "retrieving devices");
    }
  }

  async printReceipt(paymentId: string, deviceId: string): Promise<any> {
    this.logger.log(`Printing receipt for payment: ${paymentId}`);
    try {
      const { result } = await this.client.terminalApi.createTerminalAction({
        idempotencyKey: randomUUID(),
        action: {
          deadlineDuration: "PT5M",
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
    this.logger.log(
      `Creating external payment for order: ${orderId}, amount: ${amount}, currency: ${currency}, customerId: ${customerId}`,
    );
    try {
      const { result } = await this.client.paymentsApi.createPayment({
        sourceId: "EXTERNAL",
        autocomplete: true,
        customerId: customerId || undefined,
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

  async updateDeliveryFulfillmentStatus(orderId: string): Promise<Order> {
    try {
      this.logger.log(
        `Updating delivery fulfillment status for order: ${orderId}`,
      );

      // Get current order
      const { result: retrieveResult } =
        await this.client.ordersApi.retrieveOrder(orderId);
      const order = retrieveResult.order;

      // Create a new order object with just the required fields
      const deliveryFulfillments = order.fulfillments.map((fulfillment) => {
        if (
          fulfillment.type === "DELIVERY" &&
          fulfillment.state === "PROPOSED"
        ) {
          // Only update DELIVERY fulfillments that are in PROPOSED state
          return {
            uid: fulfillment.uid,
            state: "RESERVED", // Change to RESERVED to appear in KDS
          };
        }
        // Return other fulfillments unchanged
        return {
          uid: fulfillment.uid,
          state: fulfillment.state,
        };
      });

      const response = await this.client.ordersApi.updateOrder(orderId, {
        idempotencyKey: randomUUID(),
        order: {
          version: order.version,
          locationId: order.locationId,
          fulfillments: deliveryFulfillments,
        },
      });

      this.logger.log(
        `Delivery fulfillment status updated for order: ${orderId}`,
      );
      return response.result.order;
    } catch (error) {
      this.handleSquareError(error, "updating delivery fulfillment status");
    }
  }
}
