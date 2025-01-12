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
exports.ItemEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const sub_item_entity_1 = require("./sub.item.entity");
const order_entity_1 = require("./order.entity");
let ItemEntity = class ItemEntity extends sequelize_typescript_1.Model {
    toItem() {
        const item = {
            name: this.name,
            plu: this.plu,
            price: this.price,
            quantity: this.quantity,
            subItems: this.subItems.map((subItem) => subItem.toSubItem()),
        };
        return item;
    }
};
exports.ItemEntity = ItemEntity;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], ItemEntity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ItemEntity.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ItemEntity.prototype, "plu", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], ItemEntity.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => sub_item_entity_1.SubItemEntity),
    __metadata("design:type", Array)
], ItemEntity.prototype, "subItems", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], ItemEntity.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], ItemEntity.prototype, "orderId", void 0);
exports.ItemEntity = ItemEntity = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'item' })
], ItemEntity);
//# sourceMappingURL=item.entity.js.map