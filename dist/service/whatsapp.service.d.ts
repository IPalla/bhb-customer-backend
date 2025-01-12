import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/model/order';
export declare class WhatsAppService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private origin;
    private token;
    constructor(httpService: HttpService, configService: ConfigService);
    sendWhatsapp(order: Order, phoneNumber: string, messageType: WhatsAppService.MessageType): Promise<void>;
    getTemplateFromMessageType(messageType: WhatsAppService.MessageType): "nuevo_pedido_rider" | "nuevo_dinein_definitivo" | "nuevo_pickup_definitivo" | "nuevo_delivery_definitivo" | "pickup_listo_recogida" | "dinein_listo_recogida";
    buildHeaders(): {
        headers: {
            Authorization: string;
        };
    };
    buildTemplateBodyFromOrder(order: Order, destination: string, messageType: WhatsAppService.MessageType): {
        messaging_product: string;
        to: string;
        type: string;
        template: {
            name: string;
            language: {
                code: string;
            };
            components: any[];
        };
    };
    extractParametersFromOrder(order: Order, messageType: WhatsAppService.MessageType): any[];
    replaceEmptyStringsFromParameters(parametersArray: any): any;
    replaceJumpLinesFromParameters(parametersArray: any): any;
    generateAddressURl(order: Order): string;
}
export declare namespace WhatsAppService {
    type MessageType = 'RIDER_NOTIFICATION' | 'NEW_DINE_IN' | 'NEW_PICK_UP' | 'NEW_DELIVERY' | 'PICKUP_READY' | 'DINEIN_READY';
    const MessageType: {
        RIDER_NOTIFICATION: MessageType;
        NEW_DINE_IN: MessageType;
        NEW_PICK_UP: MessageType;
        NEW_DELIVERY: MessageType;
        PICKUP_READY: MessageType;
        DINEIN_READY: MessageType;
    };
}
