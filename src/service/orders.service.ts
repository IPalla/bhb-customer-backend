import { Injectable, Logger } from "@nestjs/common";
import { SquareService } from "./square.service";
import { Order } from "src/model/order";
import { SquareMapper } from "./mappers/square.mapper";
import { Customer } from "src/model/customer";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper,
  ) {}

  async createOrder(ordr: Order, customer: Customer): Promise<Order> {
    this.logger.log("Creating order");
    const customerToCreate: Customer = {
      phoneNumber: customer.phoneNumber,
      id: customer.id,
      email: ordr.customer?.email || customer.email,
      firstName: ordr.customer?.firstName || customer.firstName,
      lastName: ordr.customer?.lastName || customer.lastName,
      address: {
        street: ordr.customer?.address?.street || customer.address?.street,
      },
    };
    ordr.customer = customerToCreate;
    const createdOrder = await this.squareService.createOrder(
      this.squareMapper.orderToCreateOrderRequest(ordr),
    );
    this.logger.log("Order created");
    this.squareService
      .updateCustomer(customerToCreate)
      .then((customer) => {
        this.logger.log(`Customer updated in square: ${customer}`);
      })
      .catch((error) => {
        this.logger.error(`Error updating customer in square: ${error}`);
      });
    return this.squareMapper.squareOrderToOrder(createdOrder.order);
  }

  async getCustomerOrders(customer: Customer): Promise<Order[]> {
    this.logger.log(`Getting orders for customer: ${customer.id}`);
    const squareOrders = await this.squareService.getCustomerOrders(
      customer.id,
    );
    return squareOrders.map((order) =>
      this.squareMapper.squareOrderToOrder(order),
    );
  }

  async getOrderById(orderId: string, customerId: string): Promise<Order> {
    this.logger.log(`Fetching order with ID: ${orderId}`);
    const orders = await this.squareService.getCustomerOrders(customerId);
    const order = orders.find((order) => order.id === orderId);
    return this.squareMapper.squareOrderToOrder(order);
  }
}
