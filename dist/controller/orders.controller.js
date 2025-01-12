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
var OrdersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../service/orders.service");
const jwt_auth_guard_1 = require("../auth-strategies/jwt.auth.guard");
const rxjs_1 = require("rxjs");
const event_emitter_1 = require("@nestjs/event-emitter");
const status_1 = require("../model/status");
const events_1 = require("../model/events");
let OrdersController = OrdersController_1 = class OrdersController {
    constructor(ordersService, eventEmitter) {
        this.ordersService = ordersService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(OrdersController_1.name);
        this.notificationsObservable = (0, rxjs_1.merge)(this.fromEventEmitterToEvent(this.eventEmitter, events_1.EventType.ORDER_CREATED), this.fromEventEmitterToEvent(this.eventEmitter, events_1.EventType.ORDER_STATUS_UPDATED));
        this.notificationsObservable.subscribe({
            next: (data) => this.logger.log(`Sending SSE: ${JSON.stringify(data)}`),
        });
    }
    async getOrders(orderType, startDate, endDate) {
        this.logger.log(`Retrieving orders}`);
        return this.ordersService.getOrders(orderType, startDate, endDate);
    }
    async getOrderById(id) {
        this.logger.log(`Retrieving order: ${id}}`);
        return (await this.ordersService.getOrderById(id)).toOrder();
    }
    async deleteOrderById(id) {
        this.logger.log(`Deleting order: ${id}}`);
        await this.ordersService.deleteById(id);
    }
    async updateOrderStatus(req, id, updateOrderStatusDto, latitude, longitude) {
        this.logger.log(`Updating order: ${id}. Status: ${updateOrderStatusDto.status}. Latitude: ${latitude}. Longitude: ${longitude}`);
        if (updateOrderStatusDto.status === undefined ||
            updateOrderStatusDto.status === null ||
            !status_1.Status.StatusEnum[updateOrderStatusDto.status]) {
            this.logger.error(`Invalid status: ${updateOrderStatusDto.status}`);
            throw new common_1.HttpException(`Invalid status: ${updateOrderStatusDto.status}`, common_1.HttpStatus.BAD_REQUEST);
        }
        await this.ordersService.updateOrderStatus(id, updateOrderStatusDto.status, req.user.riderId, latitude, longitude);
    }
    getOrderNotifications() {
        this.logger.log(`Adding subscription for order events`);
        return this.notificationsObservable;
    }
    fromEventEmitterToEvent(eventEmitter, eventType) {
        return (0, rxjs_1.fromEvent)(eventEmitter, eventType).pipe((0, rxjs_1.map)((data) => ({
            data: { events: data[1], order: data[0] },
        })));
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('order_type')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteOrderById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-user-latitude')),
    __param(4, (0, common_1.Headers)('x-user-longitude')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Sse)('notifications/subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], OrdersController.prototype, "getOrderNotifications", null);
exports.OrdersController = OrdersController = OrdersController_1 = __decorate([
    (0, common_1.Controller)('bhb-customer-backend/orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        event_emitter_1.EventEmitter2])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map