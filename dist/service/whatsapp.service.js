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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const moment = require("moment");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(WhatsAppService_1.name);
        if (!this.configService.get('whatsapp.token') ||
            !this.configService.get('whatsapp.origin')) {
            throw new Error('Missing configuration property: whatsapp.token or whatsapp.origin');
        }
        this.origin = this.configService.get('whatsapp.origin');
        this.token = this.configService.get('whatsapp.token');
    }
    async sendWhatsapp(order, phoneNumber, messageType) {
        this.logger.log(`Sending whatsapp. Messagetype: ${messageType}, number: ${phoneNumber}`);
        if (!this.configService.get('whatsapp.enabled')) {
            this.logger.log(`Not sending whatsapp. Whatsapp disabled.`);
            return;
        }
        if (!phoneNumber.startsWith('+34')) {
            this.logger.warn(`Not notifying ${phoneNumber} because number is not spanish number`);
            return;
        }
        phoneNumber = phoneNumber.replace('+', '');
        const body = this.buildTemplateBodyFromOrder(order, phoneNumber, messageType);
        try {
            const response = await this.httpService.axiosRef.post(`https://graph.facebook.com/v15.0/${this.origin}/messages`, body, this.buildHeaders());
            this.logger.log(`Whatsapp sent. Status: ${response.status}`);
        }
        catch (error) {
            this.logger.error(`Error sending whatsapp. Status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
        }
    }
    getTemplateFromMessageType(messageType) {
        switch (messageType) {
            case WhatsAppService_1.MessageType.RIDER_NOTIFICATION:
                return 'nuevo_pedido_rider';
            case WhatsAppService_1.MessageType.NEW_DINE_IN:
                return 'nuevo_dinein_definitivo';
            case WhatsAppService_1.MessageType.NEW_PICK_UP:
                return 'nuevo_pickup_definitivo';
            case WhatsAppService_1.MessageType.NEW_DELIVERY:
                return 'nuevo_delivery_definitivo';
            case WhatsAppService_1.MessageType.PICKUP_READY:
                return 'pickup_listo_recogida';
            case WhatsAppService_1.MessageType.NEW_DINE_IN:
                return 'nuevo_dinein_definitivo';
            case WhatsAppService_1.MessageType.DINEIN_READY:
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
    buildTemplateBodyFromOrder(order, destination, messageType) {
        const template = this.getTemplateFromMessageType(messageType);
        var components = [];
        components.push({
            type: 'body',
            parameters: this.extractParametersFromOrder(order, messageType).slice(0, 6),
        });
        if (messageType === WhatsAppService_1.MessageType.RIDER_NOTIFICATION) {
            components.push({
                type: 'header',
                parameters: this.extractParametersFromOrder(order, messageType).slice(0, 1),
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
    extractParametersFromOrder(order, messageType) {
        var parameters = [];
        parameters.push({ type: 'text', text: order.id });
        if (messageType === WhatsAppService_1.MessageType.RIDER_NOTIFICATION) {
            parameters.push({
                type: 'text',
                text: order?.operation?.expectedReadyTs
                    ? moment(order?.operation?.expectedReadyTs)
                        .utcOffset('Europe/Madrid')
                        .format('HH:mm')
                    : '',
            });
            parameters.push({ type: 'text', text: order?.customer?.name || '' });
            parameters.push({
                type: 'text',
                text: order?.customer?.phone_number || '',
            });
            parameters.push({
                type: 'text',
                text: this.generateAddressURl(order) || '',
            });
            parameters.push({ type: 'text', text: order?.notes || '' });
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
    generateAddressURl(order) {
        const address = order?.customer?.address;
        return `${address} https://www.google.com/maps/search/?api=1&query=${encodeURI(address)}`;
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], WhatsAppService);
(function (WhatsAppService) {
    WhatsAppService.MessageType = {
        RIDER_NOTIFICATION: 'RIDER_NOTIFICATION',
        NEW_DINE_IN: 'NEW_DINE_IN',
        NEW_PICK_UP: 'NEW_PICK_UP',
        NEW_DELIVERY: 'NEW_DELIVERY',
        PICKUP_READY: 'PICKUP_READY',
        DINEIN_READY: 'DINEIN_READY',
    };
})(WhatsAppService || (exports.WhatsAppService = WhatsAppService = {}));
//# sourceMappingURL=whatsapp.service.js.map