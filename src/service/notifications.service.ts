import { Injectable, Logger } from '@nestjs/common';
import { Order } from 'src/model/models';
import { WhatsAppService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly configService: ConfigService,
  ) {}

  async notificateReady(order: Order) {
    this.logger.log(
      `Creating notifications for ready order: ${order?.id}. Type: ${order?.type}. Channel: ${order?.channel}`,
    );
    var messageType: WhatsAppService.MessageType;
    switch (order.type) {
      case Order.TypeEnum.Dinein:
        messageType = WhatsAppService.MessageType.DINEIN_READY;
        break;
      case Order.TypeEnum.Pickup:
        messageType = WhatsAppService.MessageType.PICKUP_READY;
        break;
      default:
        this.logger.log(
          `Order type does not need ready notification: ${order.type}`,
        );
        break;
    }
    if (messageType) {
      this.whatsappService.sendWhatsapp(
        order,
        order?.customer?.phone_number,
        messageType,
      );
    }
  }
  async notificateCreation(order: Order): Promise<void> {
    this.logger.log(
      `Creating notifications for new order: ${order?.id}. Type: ${order?.type}. Channel: ${order?.channel}`,
    );

    if (order.type === Order.TypeEnum.Delivery) {
      // Notify riders
      this.configService.get('whatsapp.riders').forEach((riderPhone) => {
        this.whatsappService.sendWhatsapp(
          order,
          riderPhone,
          WhatsAppService.MessageType.RIDER_NOTIFICATION,
        );
      });
    }
    if (order.channel === Order.ChannelEnum.Web) {
      var messageType: WhatsAppService.MessageType;
      switch (order.type) {
        case Order.TypeEnum.Pickup:
          messageType = WhatsAppService.MessageType.NEW_PICK_UP;
          break;
        case Order.TypeEnum.Delivery:
          messageType = WhatsAppService.MessageType.NEW_DELIVERY;
          break;
        case Order.TypeEnum.Dinein:
          messageType = WhatsAppService.MessageType.NEW_DINE_IN;
          break;
        default:
          this.logger.error(`Unknown order type: ${order.type}`);
          break;
      }
      // Notify customer
      this.whatsappService.sendWhatsapp(
        order,
        order?.customer?.phone_number,
        messageType,
      );
    }
  }
}
