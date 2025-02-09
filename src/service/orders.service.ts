import { Injectable, Logger } from "@nestjs/common";
import { SquareService } from "./square.service";
import { Order } from "src/model/order";
import { SquareMapper } from "./mappers/square.mapper";
import { Customer } from "src/model/customer";
import { InjectModel } from "@nestjs/sequelize";
import { OrderPaymentCheckout } from "src/model/order-payment-checkout.model";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper,
    @InjectModel(OrderPaymentCheckout)
    private orderPaymentCheckoutModel: typeof OrderPaymentCheckout,
  ) {}

  async createOrder(
    order: Order,
    customer: Customer | null,
    locationId: string,
    saveAddressAsDefault: boolean = false,
  ): Promise<Order> {
    this.logger.log(`Creating order for location: ${locationId}`);

    const mergedCustomer = this.mergeCustomerData(order.customer, customer);
    order.customer = mergedCustomer;
    order.locationId = locationId;

    const squareOrderRequest =
      this.squareMapper.orderToCreateOrderRequest(order);
    const createdOrder =
      await this.squareService.createOrder(squareOrderRequest);
    this.logger.log(`Order created successfully: ${createdOrder.order.id}`);

    // Async customer update without blocking order creation
    this.updateCustomerIfNeeded(
      customer,
      mergedCustomer,
      saveAddressAsDefault,
    ).catch((error) =>
      this.logger.error("Background customer update failed", { error }),
    );

    return this.squareMapper.squareOrderToOrder(createdOrder.order);
  }

  async getCustomerOrders(customer: Customer): Promise<Order[]> {
    this.logger.log(`Fetching orders for customer: ${customer.id}`);

    const squareOrders = await this.squareService.getCustomerOrders(
      customer.id,
    );
    this.logger.log(
      `Found ${squareOrders.length} orders for customer: ${customer.id}`,
    );

    return squareOrders.map((order) =>
      this.squareMapper.squareOrderToOrder(order),
    );
  }

  async getOrderById(
    orderId: string,
    customerId: string,
  ): Promise<Order | null> {
    this.logger.log(`Fetching order with ID: ${orderId}`);

    const orders = await this.squareService.getCustomerOrders(customerId);
    const order = orders.find((order) => order.id === orderId);

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      return null;
    }

    return this.squareMapper.squareOrderToOrder(order);
  }

  async createTerminalCheckout(orderId: string, deviceId: string) {
    this.logger.log(`Creating terminal checkout for order: ${orderId}`);
    const order = await this.squareService.getOrder(orderId);
    this.logger.log(`Order found in square`);
    const checkout = await this.squareService.createTerminalCheckout(
      orderId,
      order.totalMoney.amount,
      order.totalMoney.currency,
      deviceId,
    );
    this.logger.log(`Payment created in square`);
    await this.orderPaymentCheckoutModel.create({
      orderId,
      checkoutId: checkout.id,
      amount: checkout.amountMoney.amount,
      currency: checkout.amountMoney.currency,
      status: checkout.status,
    });
    this.logger.log(`Terminal checkout created successfully: ${checkout.id}`);
    return;
  }

  async handleWebhookPayment(
    status: string,
    checkoutId: string,
    paymentId?: string,
  ) {
    this.logger.log(`Handling webhook payment: ${checkoutId}`);
    const orderPaymentCheckout = await this.orderPaymentCheckoutModel.findOne({
      where: { checkoutId, status: "PENDING" },
    });
    if (!orderPaymentCheckout) {
      this.logger.warn(`No payment checkout found for checkout: ${checkoutId}`);
      return;
    }
    this.logger.log(`Order payment checkout found: ${orderPaymentCheckout.id}`);
    if (status === "COMPLETED") {
      await this.orderPaymentCheckoutModel.update(
        { paymentId, status },
        { where: { checkoutId } },
      );
    }
    this.logger.log(`Payment checkout updated: ${orderPaymentCheckout.id}`);
    return;
  }

  async getOrderPaymentCheckout(
    orderId: string,
  ): Promise<OrderPaymentCheckout> {
    this.logger.log(`Getting payment checkout for order: ${orderId}`);
    const orderPaymentCheckout = await this.orderPaymentCheckoutModel.findOne({
      where: {
        orderId: orderId,
      },
    });

    if (!orderPaymentCheckout) {
      this.logger.warn(`No payment checkout found for order: ${orderId}`);
      return null;
    }
    this.logger.log(`Found payment checkout for order: ${orderId}`);
    return orderPaymentCheckout;
  }

  private mergeCustomerData(
    orderCustomer: Partial<Customer>,
    existingCustomer: Customer | null,
  ): Customer {
    return {
      phoneNumber: existingCustomer?.phoneNumber,
      id: existingCustomer?.id,
      email: orderCustomer?.email || existingCustomer?.email,
      firstName: orderCustomer?.firstName || existingCustomer?.firstName,
      lastName: orderCustomer?.lastName || existingCustomer?.lastName,
      address: {
        address_line_1:
          orderCustomer?.address?.address_line_1 ||
          existingCustomer?.address?.address_line_1,
        address_line_2:
          orderCustomer?.address?.address_line_2 ||
          existingCustomer?.address?.address_line_2,
        locality:
          orderCustomer?.address?.locality ||
          existingCustomer?.address?.locality,
        postalCode:
          orderCustomer?.address?.postalCode ||
          existingCustomer?.address?.postalCode,
        country:
          orderCustomer?.address?.country || existingCustomer?.address?.country,
      },
    };
  }

  private async updateCustomerIfNeeded(
    customer: Customer,
    orderCustomer: Customer,
    saveAddressAsDefault: boolean = false,
  ): Promise<void> {
    if (!customer?.id) {
      return;
    }

    try {
      const customerToUpdate = {
        ...customer,
        address: saveAddressAsDefault
          ? orderCustomer.address
          : customer.address,
      };

      const updatedCustomer =
        await this.squareService.updateCustomer(customerToUpdate);
      this.logger.log(`Customer updated successfully: ${updatedCustomer.id}`);
    } catch (error) {
      this.logger.error("Failed to update customer in Square", {
        customerId: customer.id,
        error: error.message,
      });
    }
  }
}
