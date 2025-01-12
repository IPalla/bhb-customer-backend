import { Controller, Logger, Post, Body } from '@nestjs/common';
import { Status } from '../model/status';
import { OrdersService } from '../service/orders.service';
import { WaitryStatusUpdate } from 'src/model/waitry/waitry.status.update';

@Controller('bhb-customer-backend/integration/waitry')
export class WaitryWebhookController {
  private readonly logger = new Logger(WaitryWebhookController.name);
  constructor(private readonly ordersService: OrdersService) {}

  @Post('update-order')
  async createOrder(@Body() statusUpdate: WaitryStatusUpdate): Promise<void> {
    this.logger.log(
      `Received order update from Waitry. Order: ${statusUpdate?.externalDeliveryId}. Event: ${statusUpdate?.event}`,
    );
    await this.ordersService.updateOrderStatus(
      statusUpdate?.externalDeliveryId,
      this.getOrderStatusFromWaitry(statusUpdate?.event),
      'Waitry',
    );
  }

  getOrderStatusFromWaitry(waitryStatus): Status.StatusEnum {
    switch (waitryStatus) {
      case 'order_in_progress':
        return Status.StatusEnum.IN_PROGRESS;
      case 'order_ready':
      case 'order_delivered':
        return Status.StatusEnum.READY;
    }
  }
}
