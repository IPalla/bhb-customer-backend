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
var OrderEventReceiver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEventReceiver = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const events_1 = require("../model/events");
const order_1 = require("../model/order");
const notifications_service_1 = require("../service/notifications.service");
const operations_service_1 = require("../service/operations.service");
let OrderEventReceiver = OrderEventReceiver_1 = class OrderEventReceiver {
    constructor(notificationsService, operationsService) {
        this.notificationsService = notificationsService;
        this.operationsService = operationsService;
        this.logger = new common_1.Logger(OrderEventReceiver_1.name);
    }
    handleOrderCreatedEvent(order) {
        this.logger.log(`Handling order created. Order: ${order?.id}. Status: ${order.status?.status}. Type: ${order?.type}. Channel: ${order?.channel}`);
        this.notificationsService.notificateCreation(order);
    }
    handleOrderUpdatedEvent(order, events) {
        this.logger.log(`Handling order updated. Order: ${order?.id}. Status: ${order.status?.status}. Type: ${order?.type}. Channel: ${order?.channel}`);
        this.logger.log(`Events: ${events.map((ev) => ev.toString())}`);
        const operation = order.operation;
        var operationModified = false;
        if (order.channel === order_1.Order.ChannelEnum.Web &&
            events.includes(events_1.EventType.OPERATION_ORDER_READY)) {
            this.logger.log(`Order needs notification ready.`);
            this.notificationsService.notificateReady(order);
        }
        if (events.includes(events_1.EventType.OPERATION_ORDER_READY)) {
            operationModified = true;
            operation.kitchenTime = new Date().getTime() - operation.createdTs;
        }
        if (events.includes(events_1.EventType.OPERATION_ORDER_FINISHED)) {
            operationModified = true;
            operation.totalOrderTime = new Date().getTime() - operation.createdTs;
        }
        if (events.includes(events_1.EventType.OPERATION_ORDER_DELIVERED)) {
            operationModified = true;
            operation.inDeliveryTime =
                new Date().getTime() - operation.createdTs - operation.kitchenTime;
        }
        if (operationModified) {
            this.operationsService.updateOperation(operation.id, operation);
        }
    }
};
exports.OrderEventReceiver = OrderEventReceiver;
__decorate([
    (0, event_emitter_1.OnEvent)(events_1.EventType.ORDER_CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrderEventReceiver.prototype, "handleOrderCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)(events_1.EventType.ORDER_STATUS_UPDATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", void 0)
], OrderEventReceiver.prototype, "handleOrderUpdatedEvent", null);
exports.OrderEventReceiver = OrderEventReceiver = OrderEventReceiver_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        operations_service_1.OperationsService])
], OrderEventReceiver);
//# sourceMappingURL=order.event.receiver.js.map