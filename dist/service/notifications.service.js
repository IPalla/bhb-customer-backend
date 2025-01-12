"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const models_1 = require("../model/models");
const whatsapp_service_1 = require("./whatsapp.service");
const config_1 = require("@nestjs/config");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(whatsappService, configService) {
        this.whatsappService = whatsappService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async notificateReady(order) {
        this.logger.log(`Creating notifications for ready order: ${order?.id}. Type: ${order?.type}. Channel: ${order?.channel}`);
        var messageType;
        switch (order.type) {
            case models_1.Order.TypeEnum.Dinein:
                messageType = whatsapp_service_1.WhatsAppService.MessageType.DINEIN_READY;
                break;
            case models_1.Order.TypeEnum.Pickup:
                messageType = whatsapp_service_1.WhatsAppService.MessageType.PICKUP_READY;
                break;
            default:
                this.logger.log(`Order type does not need ready notification: ${order.type}`);
                break;
        }
        if (messageType) {
            this.whatsappService.sendWhatsapp(order, order?.customer?.phone_number, messageType);
        }
    }
    async notificateCreation(order) {
        this.logger.log(`Creating notifications for new order: ${order?.id}. Type: ${order?.type}. Channel: ${order?.channel}`);
        if (order.type === models_1.Order.TypeEnum.Delivery) {
            this.configService.get('whatsapp.riders').forEach((riderPhone) => {
                this.whatsappService.sendWhatsapp(order, riderPhone, whatsapp_service_1.WhatsAppService.MessageType.RIDER_NOTIFICATION);
            });
        }
        if (order.channel === models_1.Order.ChannelEnum.Web) {
            var messageType;
            switch (order.type) {
                case models_1.Order.TypeEnum.Pickup:
                    messageType = whatsapp_service_1.WhatsAppService.MessageType.NEW_PICK_UP;
                    break;
                case models_1.Order.TypeEnum.Delivery:
                    messageType = whatsapp_service_1.WhatsAppService.MessageType.NEW_DELIVERY;
                    break;
                case models_1.Order.TypeEnum.Dinein:
                    messageType = whatsapp_service_1.WhatsAppService.MessageType.NEW_DINE_IN;
                    break;
                default:
                    this.logger.error(`Unknown order type: ${order.type}`);
                    break;
            }
            this.whatsappService.sendWhatsapp(order, order?.customer?.phone_number, messageType);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsAppService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map