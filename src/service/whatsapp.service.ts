import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/model/order';
import * as moment from 'moment';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private origin: string;
  private token: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    if (
      !this.configService.get('whatsapp.token') ||
      !this.configService.get('whatsapp.origin')
    ) {
      throw new Error(
        'Missing configuration property: whatsapp.token or whatsapp.origin',
      );
    }
    this.origin = this.configService.get('whatsapp.origin');
    this.token = this.configService.get('whatsapp.token');
  }

  async sendWhatsapp(
    order: Order,
    phoneNumber: string,
    messageType: WhatsAppService.MessageType,
  ): Promise<void> {
    this.logger.log(
      `Sending whatsapp. Messagetype: ${messageType}, number: ${phoneNumber}`,
    );
    if (!this.configService.get('whatsapp.enabled')) {
      this.logger.log(`Not sending whatsapp. Whatsapp disabled.`);
      return;
    }
    // Check if the phone number is valid
    if (!phoneNumber.startsWith('+34')) {
      this.logger.warn(
        `Not notifying ${phoneNumber} because number is not spanish number`,
      );
      return;
    }
    phoneNumber = phoneNumber.replace('+', '');
    // Send whatsapp to customer based on the message type
    const body = this.buildTemplateBodyFromOrder(
      order,
      phoneNumber,
      messageType,
    );
    try {
      const response = await this.httpService.axiosRef.post(
        `https://graph.facebook.com/v15.0/${this.origin}/messages`,
        body,
        this.buildHeaders(),
      );
      this.logger.log(`Whatsapp sent. Status: ${response.status}`);
    } catch (error) {
      this.logger.error(
        `Error sending whatsapp. Status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`,
      );
    }
  }

  getTemplateFromMessageType(messageType: WhatsAppService.MessageType) {
    switch (messageType) {
      case WhatsAppService.MessageType.RIDER_NOTIFICATION:
        return 'nuevo_pedido_rider';
      case WhatsAppService.MessageType.NEW_DINE_IN:
        return 'nuevo_dinein_definitivo';
      case WhatsAppService.MessageType.NEW_PICK_UP:
        return 'nuevo_pickup_definitivo';
      case WhatsAppService.MessageType.NEW_DELIVERY:
        return 'nuevo_delivery_definitivo';
      case WhatsAppService.MessageType.PICKUP_READY:
        return 'pickup_listo_recogida';
      case WhatsAppService.MessageType.NEW_DINE_IN:
        return 'nuevo_dinein_definitivo';
      case WhatsAppService.MessageType.DINEIN_READY:
        return 'dinein_listo_recogida';
    }
  }

  buildHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }

  buildTemplateBodyFromOrder(
    order: Order,
    destination: string,
    messageType: WhatsAppService.MessageType,
  ) {
    const template = this.getTemplateFromMessageType(messageType);
    var components = [];
    components.push({
      type: 'body',
      parameters: this.extractParametersFromOrder(order, messageType).slice(
        0,
        6,
      ),
    });
    if (messageType === WhatsAppService.MessageType.RIDER_NOTIFICATION) {
      components.push({
        type: 'header',
        parameters: this.extractParametersFromOrder(order, messageType).slice(
          0,
          1,
        ),
      });
    }
    return {
      messaging_product: 'whatsapp',
      to: destination,
      type: 'template',
      template: {
        name: template,
        language: {
          code: 'es_ES',
        },
        components: components,
      },
    };
  }

  extractParametersFromOrder(
    order: Order,
    messageType: WhatsAppService.MessageType,
  ) {
    var parameters = [];
    parameters.push({ type: 'text', text: order.id });
    if (messageType === WhatsAppService.MessageType.RIDER_NOTIFICATION) {
      parameters.push({
        type: 'text',
        text: order?.operation?.expectedReadyTs
          ? moment(order?.operation?.expectedReadyTs)
              .utcOffset('Europe/Madrid')
              .format('HH:mm')
          : '',
      }); // name: 'hora_de_entrega'

      parameters.push({ type: 'text', text: order?.customer?.name || '' }); // name: 'nombre',
      parameters.push({
        type: 'text',
        text: order?.customer?.phone_number || '',
      }); // name: 'telefono',
      parameters.push({
        type: 'text',
        text: this.generateAddressURl(order) || '',
      }); // name: 'direccion',
      parameters.push({ type: 'text', text: order?.notes || '' }); // name: 'notas',
    }
    this.replaceEmptyStringsFromParameters(parameters);
    this.replaceJumpLinesFromParameters(parameters);
    return parameters;
  }
  replaceEmptyStringsFromParameters(parametersArray) {
    parametersArray.forEach((parameter) => {
      parameter.text = parameter.text.length === 0 ? ' ' : parameter.text;
    });
    return parametersArray;
  }

  replaceJumpLinesFromParameters(parametersArray) {
    parametersArray.forEach((parameter) => {
      parameter.text =
        parameter.text.length === 0
          ? ' '
          : parameter.text.replace(/[\r\n]/gm, ' ');
    });
    return parametersArray;
  }

  generateAddressURl(order: Order) {
    const address = order?.customer?.address;
    return `${address} https://www.google.com/maps/search/?api=1&query=${encodeURI(
      address,
    )}`;
  }
}

export namespace WhatsAppService {
  export type MessageType =
    | 'RIDER_NOTIFICATION'
    | 'NEW_DINE_IN'
    | 'NEW_PICK_UP'
    | 'NEW_DELIVERY'
    | 'PICKUP_READY'
    | 'DINEIN_READY';
  export const MessageType = {
    RIDER_NOTIFICATION: 'RIDER_NOTIFICATION' as MessageType,
    NEW_DINE_IN: 'NEW_DINE_IN' as MessageType,
    NEW_PICK_UP: 'NEW_PICK_UP' as MessageType,
    NEW_DELIVERY: 'NEW_DELIVERY' as MessageType,
    PICKUP_READY: 'PICKUP_READY' as MessageType,
    DINEIN_READY: 'DINEIN_READY' as MessageType,
  };
}
