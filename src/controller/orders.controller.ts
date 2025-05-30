import {
  Controller,
  Post,
  Body,
  Logger,
  Req,
  Get,
  Param,
  Query,
  BadRequestException,
  HttpCode,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { OrdersService } from "../service/orders.service";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { SquareService } from "src/service/square.service";
import { Order } from "../model/order";
import { Customer } from "src/model/models";
import { RequestWithUser } from "src/guards/jwt.guard";
import { TerminalCheckoutEntity } from "src/entity/terminal-checkout.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SquareServiceError } from "src/errors/square-service.error";

@Controller("bhb-customer-backend/orders")
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly squareService: SquareService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createOrder(
    @Req() request: RequestWithUser,
    @Body() createOrderDto: Order,
    @Query("locationId") locationId: string,
    @Query("saveAddressAsDefault") saveAddressAsDefault?: boolean,
  ): Promise<Order> {
    const customer: Customer = request.user?.customer;
    const order = await this.ordersService.createOrder(
      createOrderDto,
      customer,
      locationId,
      saveAddressAsDefault,
    );
    return order;
  }

  @Post(":orderId/terminal-checkout")
  @HttpCode(204)
  async createTerminalCheckout(
    @Param("orderId") orderId: string,
    @Query("deviceId") deviceId: string,
    @Req() request: RequestWithUser,
  ): Promise<any> {
    if (!deviceId) {
      throw new BadRequestException("Device ID is required");
    }
    this.logger.log(`Creating terminal checkout for order ${orderId}`);
    const payment = await this.ordersService.createTerminalCheckout(
      orderId,
      deviceId,
      request.user?.customer?.id,
    );
    this.logger.log("Terminal checkout created successfully");
    return;
  }

  @Post(":orderId/event")
  async createEvent(@Param("orderId") orderId: string): Promise<any> {
    this.logger.log(`Creating event for order ${orderId}`);
    this.eventEmitter.emit("order.created", orderId);
    this.logger.log("Event created successfully");
    return event;
  }

  @Post(":orderId/payment")
  async createPayment(
    @Param("orderId") orderId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<any> {
    this.logger.log(
      `Creating payment with sourceId: ${createPaymentDto.sourceId} for order ${orderId}`,
    );
    try {
      const payment = await this.squareService.createPayment(
        createPaymentDto.sourceId,
        orderId,
      );
      // For local logging
      this.logger.log(`Payment created`);
      this.eventEmitter.emit("order.created", orderId);
      // Event to create in delivery manager
      this.logger.log("Payment created successfully");
      return payment;
    } catch (error) {
      if (error instanceof SquareServiceError) {
        // Just rethrow the SquareServiceError - our filter will handle it
        throw error;
      }
      throw error;
    }
  }

  @Get(":orderId/payment-checkout")
  async getOrderPaymentCheckout(
    @Param("orderId") orderId: string,
  ): Promise<TerminalCheckoutEntity> {
    return this.ordersService.getOrderPaymentCheckout(orderId);
  }

  @Get()
  async getCustomerOrders(@Req() request: RequestWithUser): Promise<Order[]> {
    const customer: Customer = request.user?.customer;
    this.logger.log(`Fetching orders for customer: ${customer.id}`);
    return this.ordersService.getCustomerOrders(customer);
  }

  @Get(":orderId")
  async getOrderById(
    @Param("orderId") orderId: string,
    @Req() request: RequestWithUser,
  ): Promise<Order> {
    return this.ordersService.getOrderById(orderId, request.user?.customer?.id);
  }
}
