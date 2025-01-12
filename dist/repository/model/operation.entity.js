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
exports.OperationEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const order_entity_1 = require("./order.entity");
let OperationEntity = class OperationEntity extends sequelize_typescript_1.Model {
    toOperation() {
        const operation = {
            id: this.id,
            createdTs: this.createdTs,
            expectedReadyTs: this.expectedReadyTs,
            expectedDeliveredTs: this.expectedDeliveredTs,
            expectedTotalOrderTs: this.expectedTotalOrderTs,
            kitchenTime: this.kitchenTime,
            inDeliveryTime: this.inDeliveryTime,
            totalOrderTime: this.totalOrderTime,
        };
        return operation;
    }
};
exports.OperationEntity = OperationEntity;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], OperationEntity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "createdTs", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "expectedReadyTs", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "expectedDeliveredTs", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "expectedTotalOrderTs", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "kitchenTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "inDeliveryTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], OperationEntity.prototype, "totalOrderTime", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], OperationEntity.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], OperationEntity.prototype, "orderId", void 0);
exports.OperationEntity = OperationEntity = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'operation' })
], OperationEntity);
//# sourceMappingURL=operation.entity.js.map