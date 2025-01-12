"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const customer_entity_1 = require("../repository/model/customer.entity");
const item_entity_1 = require("../repository/model/item.entity");
const operation_entity_1 = require("../repository/model/operation.entity");
const order_entity_1 = require("../repository/model/order.entity");
const rider_entity_1 = require("../repository/model/rider.entity");
const status_entity_1 = require("../repository/model/status.entity");
const sub_item_entity_1 = require("../repository/model/sub.item.entity");
const orders_controller_1 = require("../controller/orders.controller");
const orders_service_1 = require("../service/orders.service");
const delieverect_webhook_controller_1 = require("../controller/delieverect.webhook.controller");
const order_event_receiver_1 = require("../event/order.event.receiver");
const whatsapp_service_1 = require("../service/whatsapp.service");
const notifications_service_1 = require("../service/notifications.service");
const axios_1 = require("@nestjs/axios");
const operations_service_1 = require("../service/operations.service");
const waitry_webhook_controller_1 = require("../controller/waitry.webhook.controller");
const kpis_controller_1 = require("../controller/kpis.controller");
const geolocation_service_1 = require("../service/geolocation.service");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            sequelize_1.SequelizeModule.forFeature([
                customer_entity_1.CustomerEntity,
                item_entity_1.ItemEntity,
                operation_entity_1.OperationEntity,
                order_entity_1.OrderEntity,
                rider_entity_1.RiderEntity,
                status_entity_1.StatusEntity,
                sub_item_entity_1.SubItemEntity,
            ]),
        ],
        providers: [
            operations_service_1.OperationsService,
            orders_service_1.OrdersService,
            order_event_receiver_1.OrderEventReceiver,
            whatsapp_service_1.WhatsAppService,
            notifications_service_1.NotificationsService,
            geolocation_service_1.GeoLocationService,
        ],
        controllers: [
            orders_controller_1.OrdersController,
            delieverect_webhook_controller_1.DelieverectWebhookController,
            waitry_webhook_controller_1.WaitryWebhookController,
            kpis_controller_1.KpisController,
        ],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map