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
var DelieverectWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelieverectWebhookController = void 0;
const common_1 = require("@nestjs/common");
const order_1 = require("../model/order");
const status_1 = require("../model/status");
const orders_service_1 = require("../service/orders.service");
const moment = require("moment-timezone");
var Channel;
(function (Channel) {
    Channel[Channel["Web"] = 22] = "Web";
    Channel[Channel["Glovo"] = 6] = "Glovo";
    Channel[Channel["JustEat"] = 9] = "JustEat";
    Channel[Channel["Uber"] = 7] = "Uber";
    Channel[Channel["Waitry"] = 10101] = "Waitry";
    Channel[Channel["Deliverect"] = 1] = "Deliverect";
})(Channel || (Channel = {}));
var ChannelLink;
(function (ChannelLink) {
    ChannelLink["Web"] = "636b82ad5c7f22294fc770c7";
    ChannelLink["WebDineIn"] = "646cc0a40b19e91d2ff1caaa";
})(ChannelLink || (ChannelLink = {}));
var PreparationTime;
(function (PreparationTime) {
    PreparationTime[PreparationTime["KitchenDineIn"] = 15] = "KitchenDineIn";
    PreparationTime[PreparationTime["KitchenPickup"] = 15] = "KitchenPickup";
    PreparationTime[PreparationTime["KitchenDelivery"] = 15] = "KitchenDelivery";
    PreparationTime[PreparationTime["Delivery"] = 15] = "Delivery";
})(PreparationTime || (PreparationTime = {}));
let DelieverectWebhookController = DelieverectWebhookController_1 = class DelieverectWebhookController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_1.Logger(DelieverectWebhookController_1.name);
    }
    async createOrder(order) {
        this.logger.log(`Received new order from Deliverect: ${order?.channelOrderDisplayId}`);
        const newOrder = this.fromDeliverect(order);
        await this.ordersService.storeOrder(newOrder);
    }
    async updateOrder(orderUpdate) {
        this.logger.log(`Received update order from Deliverect: ${orderUpdate?.channelOrderId}. Status: ${orderUpdate?.status}`);
        const preparedStatus = [60, 70, 90];
        if (!preparedStatus.includes(orderUpdate.status)) {
            this.logger.log(`Ignored status from Deliverect: ${orderUpdate.status}`);
            return;
        }
        else {
            await this.ordersService.updateOrderStatus(orderUpdate?.orderId, status_1.Status.StatusEnum.READY, 'Deliverect');
        }
    }
    fromDeliverect(deliverectNewOrder) {
        const response = {};
        const orderId = deliverectNewOrder.channelOrderDisplayId;
        response.id = orderId;
        response.externalId = deliverectNewOrder._id;
        response.notes = this.truncateToVarchar255(deliverectNewOrder.note);
        const status = {};
        status.status = status_1.Status.StatusEnum.PENDING;
        status.createdBy = 'Deliverect';
        status.createdAtTs = Date.now();
        response.statuses = [status];
        response.status = status;
        response.date = deliverectNewOrder._created;
        response.type = this.getTypeFromDeliverectOrderType(deliverectNewOrder.orderType, deliverectNewOrder.channelLink, deliverectNewOrder.channel, deliverectNewOrder.note);
        response.channel = this.getChannelFromOrder(deliverectNewOrder.channel);
        response.amount = this.getOrderAmount(deliverectNewOrder);
        response.items = deliverectNewOrder.items;
        response.scheduled =
            deliverectNewOrder.deliveryIsAsap === false &&
                response.channel === order_1.Order.ChannelEnum.JustEat;
        const customer = {};
        customer.address = deliverectNewOrder?.deliveryAddress?.source;
        customer.email = deliverectNewOrder?.customer?.email;
        customer.name = deliverectNewOrder?.customer?.name;
        customer.phone_number = deliverectNewOrder?.customer?.phoneNumber;
        if (deliverectNewOrder?.deliveryAddress?.coordinates?.coordinates
            && deliverectNewOrder?.deliveryAddress?.coordinates?.coordinates.length === 2) {
            customer.addressLatitude = `${deliverectNewOrder?.deliveryAddress?.coordinates.coordinates[1]}`;
            customer.addressLongitude = `${deliverectNewOrder?.deliveryAddress?.coordinates.coordinates[0]}`;
        }
        response.customer = customer;
        const operation = {};
        operation.createdTs = Date.now();
        operation.expectedTotalOrderTs = this.getExpectedTotalOrderTs(response.scheduled, response.type, deliverectNewOrder.pickupTime, deliverectNewOrder.timezone);
        operation.expectedReadyTs = this.getExpectedReadyTs(operation.expectedTotalOrderTs, response.type);
        if (response.scheduled) {
            operation;
        }
        operation.expectedDeliveredTs =
            response.type === order_1.Order.TypeEnum.Delivery
                ? operation.expectedTotalOrderTs
                : null;
        response.operation = operation;
        return response;
    }
    getExpectedReadyTs(expectedTotalOrderTs, type) {
        var expectedReadyTs = expectedTotalOrderTs;
        if (type === order_1.Order.TypeEnum.Delivery)
            return expectedReadyTs - PreparationTime.Delivery * 60 * 1000;
        return expectedReadyTs;
    }
    getExpectedTotalOrderTs(scheduled, type, expectedScheduledReadyTime, deliverectTimeZone) {
        var expectedTotalOrder = Date.now();
        if (scheduled) {
            return moment(expectedScheduledReadyTime)
                .tz(deliverectTimeZone)
                .add(15, 'minutes')
                .toDate()
                .getTime();
        }
        if (type === order_1.Order.TypeEnum.Dinein)
            expectedTotalOrder += PreparationTime.KitchenDineIn * 60 * 1000;
        if (type === order_1.Order.TypeEnum.Pickup)
            expectedTotalOrder += PreparationTime.KitchenPickup * 60 * 1000;
        if (type === order_1.Order.TypeEnum.Delivery)
            expectedTotalOrder +=
                PreparationTime.KitchenDelivery * 60 * 1000 +
                    PreparationTime.Delivery * 60 * 1000;
        return expectedTotalOrder;
    }
    getTypeFromDeliverectOrderType(deliverectOrderType, channelLink, channel, note) {
        if (channelLink === ChannelLink.WebDineIn ||
            note?.includes(' Entrega: Para tomar aquí') ||
            (channel === Channel.Deliverect && deliverectOrderType === 1)) {
            return order_1.Order.TypeEnum.Dinein;
        }
        switch (deliverectOrderType) {
            case 1:
            case 3:
                return order_1.Order.TypeEnum.Pickup;
            case 2:
                return order_1.Order.TypeEnum.Delivery;
            default:
                return order_1.Order.TypeEnum.Unknown;
        }
    }
    getChannelFromOrder(channel) {
        switch (channel) {
            case Channel.Web:
                return order_1.Order.ChannelEnum.Web;
            case Channel.Deliverect:
                return order_1.Order.ChannelEnum.Deliverect;
            case Channel.Glovo:
                return order_1.Order.ChannelEnum.Glovo;
            case Channel.JustEat:
                return order_1.Order.ChannelEnum.JustEat;
            case Channel.Uber:
                return order_1.Order.ChannelEnum.Uber;
            case Channel.Waitry:
                return order_1.Order.ChannelEnum.Waitry;
            default:
                return order_1.Order.ChannelEnum.Unknown;
        }
    }
    getOrderAmount(deliverectNewOrder) {
        const deliveryPrice = deliverectNewOrder.deliveryCost || 0;
        const itemsPrice = deliverectNewOrder.items.reduce((accumulator, item) => {
            const itemPrice = item.price;
            const itemQuantity = item.quantity;
            const subItemsPrice = item?.subItems?.reduce((subAccumulator, subItem) => (subAccumulator += (subItem.price * subItem.quantity)), 0);
            return (accumulator += itemPrice * itemQuantity + subItemsPrice);
        }, 0);
        return itemsPrice + deliveryPrice;
    }
    truncateToVarchar255(text) {
        if (!text)
            return '';
        const maxLength = 255;
        return (text.length <= maxLength) ? text : text.substring(0, maxLength);
    }
};
exports.DelieverectWebhookController = DelieverectWebhookController;
__decorate([
    (0, common_1.Post)('new-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DelieverectWebhookController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('update-order'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DelieverectWebhookController.prototype, "updateOrder", null);
exports.DelieverectWebhookController = DelieverectWebhookController = DelieverectWebhookController_1 = __decorate([
    (0, common_1.Controller)('bhb-customer-backend/integration/deliverect'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], DelieverectWebhookController);
//# sourceMappingURL=delieverect.webhook.controller.js.map