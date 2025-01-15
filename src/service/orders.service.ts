import { Injectable, Logger } from '@nestjs/common';
import { SquareService } from './square.service';
import { Order } from 'src/model/order';
import { CreateOrderResponse } from 'square';
import { SquareMapper } from './mappers/square.mapper';
import { Customer } from 'src/model/customer';
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly squareService: SquareService, private readonly squareMapper: SquareMapper) {}

  async createOrder(ordr: Order, customer: Customer): Promise<CreateOrderResponse> {
    this.logger.log('Creating order');
    const customerToCreate: Customer = {
        phoneNumber: customer.phoneNumber,
        id: customer.id,
        email: ordr.customer?.email || customer.email,
        firstName: ordr.customer?.firstName || customer.firstName,
        lastName: ordr.customer?.lastName || customer.lastName,
        address: ordr.customer?.address || customer.address
    };
    ordr.customer = customerToCreate;
    const createdOrder = await this.squareService.createOrder(this.squareMapper.orderToCreateOrderRequest(ordr));
    this.logger.log('Order created');
    // TODO: Store customer information in square
    return createdOrder;
  }
} 