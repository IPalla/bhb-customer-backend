import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventType } from 'src/model/events';
import { Operation } from 'src/model/operation';
import { Order } from 'src/model/order';
import { Status } from 'src/model/status';
import { NotificationsService } from 'src/service/notifications.service';
import { OperationsService } from 'src/service/operations.service';

@Injectable()
export class OrderEventReceiver {
  private readonly logger = new Logger(OrderEventReceiver.name);
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly operationsService: OperationsService,
  ) {}

  @OnEvent(EventType.ORDER_CREATED)
  handleOrderCreatedEvent(order: Order) {
    this.logger.log(
      `Handling order created. Order: ${order?.id}. Status: ${order.status?.status}. Type: ${order?.type}. Channel: ${order?.channel}`,
    );
    this.notificationsService.notificateCreation(order);
  }

  @OnEvent(EventType.ORDER_STATUS_UPDATED)
  handleOrderUpdatedEvent(order: Order, events: EventType[]) {
    this.logger.log(
      `Handling order updated. Order: ${order?.id}. Status: ${order.status?.status}. Type: ${order?.type}. Channel: ${order?.channel}`,
    );
    this.logger.log(`Events: ${events.map((ev) => ev.toString())}`);
    const operation: Operation = order.operation;
    var operationModified: boolean = false;
    // Ready notification for web orders
    if (
      order.channel === Order.ChannelEnum.Web &&
      events.includes(EventType.OPERATION_ORDER_READY)
    ) {
      this.logger.log(`Order needs notification ready.`);
      this.notificationsService.notificateReady(order);
    }
    if (events.includes(EventType.OPERATION_ORDER_READY)) {
      operationModified = true;
      operation.kitchenTime = new Date().getTime() - operation.createdTs;
    }

    if (events.includes(EventType.OPERATION_ORDER_FINISHED)) {
      operationModified = true;
      operation.totalOrderTime = new Date().getTime() - operation.createdTs;
    }

    if (events.includes(EventType.OPERATION_ORDER_DELIVERED)) {
      operationModified = true;
      operation.inDeliveryTime =
        new Date().getTime() - operation.createdTs - operation.kitchenTime;
    }
    if (operationModified) {
      this.operationsService.updateOperation(operation.id, operation);
    }
  }
}
