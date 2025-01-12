import { Order } from 'src/model/models';
import { WhatsAppService } from './whatsapp.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private readonly whatsappService;
    private readonly configService;
    private readonly logger;
    constructor(whatsappService: WhatsAppService, configService: ConfigService);
    notificateReady(order: Order): Promise<void>;
    notificateCreation(order: Order): Promise<void>;
}
