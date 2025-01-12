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
exports.SubItemEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const item_entity_1 = require("./item.entity");
let SubItemEntity = class SubItemEntity extends sequelize_typescript_1.Model {
    toSubItem() {
        const subItem = {
            id: this.id,
            name: this.name,
            plu: this.plu,
            price: this.price,
            quantity: this.quantity,
        };
        return subItem;
    }
};
exports.SubItemEntity = SubItemEntity;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], SubItemEntity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], SubItemEntity.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], SubItemEntity.prototype, "plu", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], SubItemEntity.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], SubItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => item_entity_1.ItemEntity),
    __metadata("design:type", item_entity_1.ItemEntity)
], SubItemEntity.prototype, "item", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => item_entity_1.ItemEntity),
    __metadata("design:type", item_entity_1.ItemEntity)
], SubItemEntity.prototype, "itemId", void 0);
exports.SubItemEntity = SubItemEntity = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'sub_item' })
], SubItemEntity);
//# sourceMappingURL=sub.item.entity.js.map