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
var KpisController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpisController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../service/orders.service");
const order_1 = require("../model/order");
const status_1 = require("../model/status");
let KpisController = KpisController_1 = class KpisController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(KpisController_1.name);
    }
    async getKpis(orderType, startDate, endDate) {
        this.logger.log(`Retrieving kpis for order type: ${orderType}, start date: ${startDate}, end date: ${endDate}`);
        const orders = await this.ordersService.getOrders(orderType, startDate, endDate);
        var kpis = {};
        kpis.totalOrders = orders.length;
        kpis.finishedOrders = orders.filter(this.isFinishedOrder).length;
        kpis.inPreparationOrders = orders.filter(this.isInPreparationOrder).length;
        const finishedNonScheduledOrders = orders
            .filter(this.isFinishedOrder)
            .filter(this.isNotScheduledOrder);
        kpis.averagePreparationTime =
            finishedNonScheduledOrders.reduce((acc, order) => acc + order?.operation?.kitchenTime, 0) / finishedNonScheduledOrders.length;
        kpis.minPreparationTime = Math.min(...finishedNonScheduledOrders.map((order) => order?.operation?.kitchenTime));
        kpis.maxPreparationTime = Math.max(...finishedNonScheduledOrders.map((order) => order?.operation?.kitchenTime));
        kpis.awaitingOrders = orders.filter(this.isWaitingForDeliveryOrder).length;
        kpis.inDeliveryOrders = orders.filter(this.isInDeliveryOrder).length;
        kpis.averageDeliveryTime =
            orders
                .filter(this.isDeliveredOrder)
                .reduce((acc, order) => acc + order?.operation?.inDeliveryTime, 0) /
                orders.filter(this.isDeliveredOrder).length;
        kpis.minDeliveryTime = Math.min(...orders.map((order) => order?.operation?.inDeliveryTime));
        kpis.maxDeliveryTime = Math.max(...orders.map((order) => order?.operation?.inDeliveryTime));
        kpis.averageEndToEndTime =
            finishedNonScheduledOrders.reduce((acc, order) => acc + order?.operation?.totalOrderTime, 0) / finishedNonScheduledOrders.length;
        kpis.minEndToEndTime = Math.min(...finishedNonScheduledOrders.map((order) => order?.operation?.totalOrderTime));
        kpis.maxEndToEndTime = Math.max(...finishedNonScheduledOrders.map((order) => order?.operation?.totalOrderTime));
        kpis.pickupOrders = orders.filter((order) => order.type === order_1.Order.TypeEnum.Pickup).length;
        kpis.deliveredOrders = orders.filter(this.isDeliveredOrder).length;
        kpis.selledProducts = this.getSelledProducts(orders);
        kpis.mostSelledProduct =
            kpis.selledProducts.length > 0
                ? kpis.selledProducts.sort((prd1, prd2) => prd1[1] - prd2[1])[0][0]
                : null;
        return kpis;
    }
    isFinishedOrder(order) {
        return (order?.operation?.totalOrderTime !== null &&
            order?.operation?.totalOrderTime !== undefined);
    }
    isDeliveredOrder(order) {
        return order?.status?.status === status_1.Status.StatusEnum.DELIVERED;
    }
    isInPreparationOrder(order) {
        return (order?.operation?.kitchenTime == null ||
            order?.operation?.kitchenTime == undefined);
    }
    isWaitingForDeliveryOrder(order) {
        return (order.type === order_1.Order.TypeEnum.Delivery &&
            (order.status.status === status_1.Status.StatusEnum.READY ||
                order.status.status === status_1.Status.StatusEnum.PREPARED));
    }
    isInDeliveryOrder(order) {
        return order.status.status === status_1.Status.StatusEnum.IN_DELIVERY;
    }
    isNotScheduledOrder(order) {
        return !order.scheduled;
    }
    getSelledProducts(orders) {
        var products = [];
        orders.forEach((order) => {
            order.items.forEach((item) => {
                var product = products.find((p) => p[0] === item.name);
                if (product) {
                    product[1] += item.quantity;
                }
                else {
                    products.push([item.name, item.quantity]);
                }
            });
        });
        return products;
    }
};
exports.KpisController = KpisController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('order_type')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String]),
    __metadata("design:returntype", Promise)
], KpisController.prototype, "getKpis", null);
exports.KpisController = KpisController = KpisController_1 = __decorate([
    (0, common_1.Controller)('bhb-customer-backend/kpis'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], KpisController);
//# sourceMappingURL=kpis.controller.js.map