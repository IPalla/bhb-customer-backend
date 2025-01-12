import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerEntity } from '../repository/model/customer.entity';
import { ItemEntity } from '../repository/model/item.entity';
import { OperationEntity } from '../repository/model/operation.entity';
import { OrderEntity } from '../repository/model/order.entity';
import { RiderEntity } from '../repository/model/rider.entity';
import { StatusEntity } from '../repository/model/status.entity';
import { SubItemEntity } from '../repository/model/sub.item.entity';

import { OrdersController } from '../controller/orders.controller';
import { OrdersService } from '../service/orders.service';

import { DelieverectWebhookController } from '../controller/delieverect.webhook.controller';
import { OrderEventReceiver } from 'src/event/order.event.receiver';
import { WhatsAppService } from 'src/service/whatsapp.service';
import { NotificationsService } from 'src/service/notifications.service';
import { HttpModule } from '@nestjs/axios';
import { OperationsService } from 'src/service/operations.service';
import { WaitryWebhookController } from 'src/controller/waitry.webhook.controller';
import { KpisController } from 'src/controller/kpis.controller';
import { GeoLocationService } from 'src/service/geolocation.service';

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      CustomerEntity,
      ItemEntity,
      OperationEntity,
      OrderEntity,
      RiderEntity,
      StatusEntity,
      SubItemEntity,
    ]),
  ],
  providers: [
    OperationsService,
    OrdersService,
    OrderEventReceiver,
    WhatsAppService,
    NotificationsService,
    GeoLocationService,
  ],
  controllers: [
    OrdersController,
    DelieverectWebhookController,
    WaitryWebhookController,
    KpisController,
  ],
})
export class OrdersModule {}
