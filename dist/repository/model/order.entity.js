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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const order_1 = require("../../model/order");
const rider_entity_1 = require("./rider.entity");
const customer_entity_1 = require("./customer.entity");
const operation_entity_1 = require("./operation.entity");
const item_entity_1 = require("./item.entity");
const status_entity_1 = require("./status.entity");
let OrderEntity = class OrderEntity extends sequelize_typescript_1.Model {
    toOrder() {
        const order = {
            id: this.id,
            externalId: this.externalId,
            date: this.date,
            scheduled: this.scheduled,
            type: order_1.Order.TypeEnum[this.type],
            channel: order_1.Order.ChannelEnum[this.channel],
            amount: this.amount,
            notes: this.notes,
            customer: this.customer?.toCustomer(),
            operation: this.operation?.toOperation(),
            statuses: this.statuses?.map((status) => status.toStatus()),
            status: this.statuses
                ? this.statuses
                    .sort((a, b) => b.createdAtTs - a.createdAtTs)[0]
                    .toStatus()
                : undefined,
            items: this.items?.map((item) => item.toItem()),
            rider: this.rider?.toRider(),
        };
        return order;
    }
};
exports.OrderEntity = OrderEntity;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], OrderEntity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], OrderEntity.prototype, "externalId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", String)
], OrderEntity.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], OrderEntity.prototype, "scheduled", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], OrderEntity.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], OrderEntity.prototype, "channel", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], OrderEntity.prototype, "rider_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], OrderEntity.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], OrderEntity.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => customer_entity_1.CustomerEntity),
    __metadata("design:type", customer_entity_1.CustomerEntity)
], OrderEntity.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => operation_entity_1.OperationEntity),
    __metadata("design:type", operation_entity_1.OperationEntity)
], OrderEntity.prototype, "operation", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => status_entity_1.StatusEntity),
    __metadata("design:type", Array)
], OrderEntity.prototype, "statuses", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => item_entity_1.ItemEntity),
    __metadata("design:type", Array)
], OrderEntity.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => rider_entity_1.RiderEntity, 'rider_id'),
    __metadata("design:type", rider_entity_1.RiderEntity)
], OrderEntity.prototype, "rider", void 0);
exports.OrderEntity = OrderEntity = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'order' })
], OrderEntity);
//# sourceMappingURL=order.entity.js.map