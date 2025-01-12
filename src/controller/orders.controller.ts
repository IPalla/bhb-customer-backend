import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Headers,
  Query,
  Request,
  Logger,
  UseGuards,
  Sse,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from '../service/orders.service';
import { Order } from '../model/order';
import { StatusUpdate } from '../model/statusUpdate';
import { JwtAuthGuard } from '../auth-strategies/jwt.auth.guard';
import { fromEvent, map, merge, Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Status } from '../model/status';
import { EventType } from 'src/model/events';

@Controller('bhb-customer-backend/orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  private notificationsObservable: Observable<MessageEvent<any>>;
  constructor(
    private readonly ordersService: OrdersService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.notificationsObservable = merge(
      this.fromEventEmitterToEvent(this.eventEmitter, EventType.ORDER_CREATED),
      this.fromEventEmitterToEvent(
        this.eventEmitter,
        EventType.ORDER_STATUS_UPDATED,
      ),
    );
    this.notificationsObservable.subscribe({
      next: (data) => this.logger.log(`Sending SSE: ${JSON.stringify(data)}`),
    });
  }

  @Get()
  async getOrders(
    @Query('order_type') orderType?: string[],
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<Order[]> {
    this.logger.log(`Retrieving orders}`);
    return this.ordersService.getOrders(orderType, startDate, endDate);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<Order> {
    this.logger.log(`Retrieving order: ${id}}`);
    return (await this.ordersService.getOrderById(id)).toOrder();
  }

  @Delete(':id')
  async deleteOrderById(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting order: ${id}}`);
    await this.ordersService.deleteById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: StatusUpdate,
    @Headers('x-user-latitude') latitude: string,
    @Headers('x-user-longitude') longitude: string,
  ): Promise<void> {
    this.logger.log(
      `Updating order: ${id}. Status: ${updateOrderStatusDto.status}. Latitude: ${latitude}. Longitude: ${longitude}`,
    );
    if (
      updateOrderStatusDto.status === undefined ||
      updateOrderStatusDto.status === null ||
      !Status.StatusEnum[updateOrderStatusDto.status]
    ) {
      this.logger.error(`Invalid status: ${updateOrderStatusDto.status}`);
      throw new HttpException(
        `Invalid status: ${updateOrderStatusDto.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
      req.user.riderId,
      latitude,
      longitude,
    );
  }

  @Sse('notifications/subscribe')
  getOrderNotifications(): Observable<MessageEvent> {
    this.logger.log(`Adding subscription for order events`);
    return this.notificationsObservable;
  }

  fromEventEmitterToEvent(eventEmitter: EventEmitter2, eventType: EventType) {
    return fromEvent(eventEmitter, eventType).pipe(
      map(
        (data: any) =>
          ({
            data: { events: data[1], order: data[0] },
          }) as MessageEvent,
      ),
    );
  }
}
