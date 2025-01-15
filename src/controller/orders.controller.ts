import { Controller, Post, Body, Logger, Req } from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { SquareService } from 'src/service/square.service';
import { Order } from '../model/order';
import { Customer } from 'src/model/models';
import { RequestWithUser } from 'src/guards/jwt.guard';



@Controller('bhb-customer-backend/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  
  constructor(private readonly ordersService: OrdersService, private readonly squareService: SquareService) {}

  @Post()
  async createOrder(@Req() request: RequestWithUser, @Body() createOrderDto: Order): Promise<any> {
    const customer: Customer = request.user?.customer;
    this.logger.log(`Creating order with items: ${JSON.stringify(createOrderDto)}`);
    const order = await this.ordersService.createOrder(createOrderDto, customer);
    //this.logger.log(`Order created successfully with ID: ${order.id}`);
    return order;
  }

  @Post('payment')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<any> {
    this.logger.log(`Creating payment with sourceId: ${createPaymentDto.sourceId}`);
    //const payment = await this.ordersService.createPayment(createPaymentDto.sourceId);
    const payment = await this.squareService.createPayment(createPaymentDto.sourceId, createPaymentDto.orderId);
    // For local logging
    this.logger.log(`Payment created: ${JSON.stringify(payment, (_, value) => 
      typeof value === 'bigint' ? value.toString() : value
    )}`);
    
    this.logger.log('Payment created successfully');
    return payment;
  }
} 