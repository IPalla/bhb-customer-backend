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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const order_1 = require("../model/order");
const order_entity_1 = require("../repository/model/order.entity");
const rider_entity_1 = require("../repository/model/rider.entity");
const item_entity_1 = require("../repository/model/item.entity");
const sequelize_2 = require("sequelize");
const status_1 = require("../model/status");
const event_emitter_1 = require("@nestjs/event-emitter");
const status_entity_1 = require("../repository/model/status.entity");
const status_machine_1 = require("./status.machine");
const events_1 = require("../model/events");
const geolocation_service_1 = require("./geolocation.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(orderModel, statusModel, geolocationService, eventEmitter) {
        this.orderModel = orderModel;
        this.statusModel = statusModel;
        this.geolocationService = geolocationService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async storeOrder(order) {
        this.logger.log(`Storing new order`);
        if (order.type === order_1.Order.TypeEnum.Delivery && (order.customer.addressLatitude === undefined || order.customer.addressLongitude === undefined)) {
            this.logger.log('Order is a delivery. Getting coordinates');
            const { latitude, longitude } = await this.geolocationService.getCoordinatesFromADdress(order.customer.address);
            this.logger.log(`Obtained coordinates: ${latitude}, ${longitude}`);
            order.customer.addressLatitude = latitude.toString();
            order.customer.addressLongitude = longitude.toString();
        }
        try {
            const createdOrder = await this.orderModel.create(order, {
                include: [
                    order_entity_1.OrderEntity.associations['statuses'],
                    order_entity_1.OrderEntity.associations['rider'],
                    order_entity_1.OrderEntity.associations['operation'],
                    order_entity_1.OrderEntity.associations['customer'],
                    {
                        model: item_entity_1.ItemEntity,
                        as: 'items',
                        include: [item_entity_1.ItemEntity.associations['subItems']],
                    },
                ],
            });
            if (!createdOrder) {
                throw new Error('Failed to store order');
            }
        }
        catch (e) {
            this.logger.error(`Error storing the order: ${e.message}`);
            this.logger.error(`Errors: ${e?.errors?.map((error) => error.message).join(', ')}`);
            throw new common_1.HttpException(`Error storing the order: ${e.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.eventEmitter.emit(events_1.EventType.ORDER_CREATED, order, [
            events_1.EventType.ORDER_CREATED,
        ]);
    }
    async updateOrderStatus(id, status, createdBy, latitude, longitude) {
        this.logger.log(`Updating order: ${id}. Status: ${status}`);
        const order = await this.getOrderById(id);
        var orderDto = order.toOrder();
        if (!(0, status_machine_1.isValidTransition)(orderDto.status.status, status, orderDto.type)) {
            this.logger.error(`Invalid status transition from ${orderDto.status.status} to ${status}`);
            throw new common_1.HttpException(`Invalid status transition from ${orderDto.status.status} to ${status}`, common_1.HttpStatus.BAD_REQUEST);
        }
        this.distanceCheck(orderDto, status, latitude, longitude);
        await this.statusModel.create({
            status,
            createdBy,
            orderId: order.id,
            latitude,
            longitude,
            createdAtTs: new Date().getTime(),
        });
        if (status === status_1.Status.StatusEnum.IN_DELIVERY ||
            status === status_1.Status.StatusEnum.DELIVERED) {
            this.logger.log(`Assigning rider to order: ${id}`);
            await this.updateOrderRider(id, createdBy, order);
        }
        var eventsToEmit = (0, status_machine_1.getEventsFromTransition)(orderDto.status.status, status, orderDto.type);
        this.getOrderById(id).then((order) => {
            this.eventEmitter.emit(events_1.EventType.ORDER_STATUS_UPDATED, order.toOrder(), eventsToEmit);
        });
        return order;
    }
    async getOrderById(id) {
        this.logger.log(`Retrieving order: ${id}`);
        const order = await this.orderModel.findOne({
            where: {
                [sequelize_2.Op.or]: [{ id: id }, { externalId: id }],
            },
            include: [
                order_entity_1.OrderEntity.associations['statuses'],
                order_entity_1.OrderEntity.associations['rider'],
                order_entity_1.OrderEntity.associations['operation'],
                order_entity_1.OrderEntity.associations['customer'],
                {
                    model: item_entity_1.ItemEntity,
                    as: 'items',
                    include: [item_entity_1.ItemEntity.associations['subItems']],
                },
            ],
        });
        if (!order) {
            this.logger.error('Order not found');
            throw new common_1.HttpException('Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        return order;
    }
    async getOrders(orderType, startDate, endDate) {
        this.logger.log(`Getting orders: orderType=${orderType}, startDate=${startDate}, endDate=${endDate}`);
        const whereClause = {};
        if (orderType) {
            whereClause.type = orderType;
        }
        if (startDate && endDate) {
            whereClause.createdAt = {
                [sequelize_2.Op.between]: [startDate, endDate],
            };
        }
        const orders = await this.orderModel.findAll({
            include: [
                order_entity_1.OrderEntity.associations['statuses'],
                order_entity_1.OrderEntity.associations['rider'],
                order_entity_1.OrderEntity.associations['operation'],
                order_entity_1.OrderEntity.associations['customer'],
                {
                    model: item_entity_1.ItemEntity,
                    as: 'items',
                    include: [item_entity_1.ItemEntity.associations['subItems']],
                },
            ],
            where: whereClause,
        });
        return orders.map((order) => order.toOrder());
    }
    async deleteById(id) {
        this.logger.log(`Deleting order: ${id}`);
        const order = await this.orderModel.findByPk(id);
        if (!order) {
            this.logger.error('Order not found');
            throw new common_1.HttpException('Order not found', common_1.HttpStatus.NOT_FOUND);
        }
        await order.destroy();
    }
    distanceCheck(orderDto, status, latitude, longitude) {
        if (orderDto.type === order_1.Order.TypeEnum.Delivery) {
            if (status === status_1.Status.StatusEnum.IN_DELIVERY)
                this.geolocationService.verifyInDeliveryDistance({
                    latitude,
                    longitude,
                });
            if (status === status_1.Status.StatusEnum.DELIVERED)
                this.geolocationService.verifyDeliveryDistance({ latitude, longitude }, {
                    latitude: orderDto.customer.addressLatitude,
                    longitude: orderDto.customer.addressLongitude,
                });
        }
    }
    async updateOrderRider(orderId, riderId, order, transactionHost) {
        this.logger.log(`Adding rider to order: ${orderId}`);
        if (order.type !== order_1.Order.TypeEnum.Delivery) {
            this.logger.error('Order is not a delivery');
            return;
        }
        const rider = await rider_entity_1.RiderEntity.findByPk(riderId);
        if (!rider) {
            this.logger.error('Rider not found');
            throw new common_1.HttpException('Rider not found', common_1.HttpStatus.UNAUTHORIZED);
        }
        if (order?.rider !== null && rider.id !== order?.rider_id) {
            this.logger.error(`Rider does not match original rider. Original: ${order.rider_id}, new: ${rider.id}`);
            throw new common_1.HttpException(`Rider does not match original rider. Original: ${order.rider_id}, new: ${rider.id}`, common_1.HttpStatus.CONFLICT);
        }
        order.rider_id = rider.id;
        await order.save({ transaction: transactionHost });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(order_entity_1.OrderEntity)),
    __param(1, (0, sequelize_1.InjectModel)(status_entity_1.StatusEntity)),
    __metadata("design:paramtypes", [Object, Object, geolocation_service_1.GeoLocationService,
        event_emitter_1.EventEmitter2])
], OrdersService);
//# sourceMappingURL=orders.service.js.map