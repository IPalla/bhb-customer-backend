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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WaitryWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitryWebhookController = void 0;
const common_1 = require("@nestjs/common");
const status_1 = require("../model/status");
const orders_service_1 = require("../service/orders.service");
let WaitryWebhookController = WaitryWebhookController_1 = class WaitryWebhookController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(WaitryWebhookController_1.name);
    }
    async createOrder(statusUpdate) {
        this.logger.log(`Received order update from Waitry. Order: ${statusUpdate?.externalDeliveryId}. Event: ${statusUpdate?.event}`);
        await this.ordersService.updateOrderStatus(statusUpdate?.externalDeliveryId, this.getOrderStatusFromWaitry(statusUpdate?.event), 'Waitry');
    }
    getOrderStatusFromWaitry(waitryStatus) {
        switch (waitryStatus) {
            case 'order_in_progress':
                return status_1.Status.StatusEnum.IN_PROGRESS;
            case 'order_ready':
            case 'order_delivered':
                return status_1.Status.StatusEnum.READY;
        }
    }
};
exports.WaitryWebhookController = WaitryWebhookController;
__decorate([
    (0, common_1.Post)('update-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaitryWebhookController.prototype, "createOrder", null);
exports.WaitryWebhookController = WaitryWebhookController = WaitryWebhookController_1 = __decorate([
    (0, common_1.Controller)('bhb-customer-backend/integration/waitry'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], WaitryWebhookController);
//# sourceMappingURL=waitry.webhook.controller.js.map