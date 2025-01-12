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
exports.IncidentEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const order_entity_1 = require("./order.entity");
const incident_1 = require("../../model/incident");
const rider_entity_1 = require("./rider.entity");
let IncidentEntity = class IncidentEntity extends sequelize_typescript_1.Model {
    toIncident() {
        const incident = {
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            comments: this.comments,
            incidentType: incident_1.Incident.IncidentTypeEnum[this.incidentType],
            couponGenerated: this.couponGenerated,
            solved: this.solved,
            orderId: this.orderId
        };
        return incident;
    }
};
exports.IncidentEntity = IncidentEntity;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], IncidentEntity.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => rider_entity_1.RiderEntity),
    __metadata("design:type", String)
], IncidentEntity.prototype, "createdBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => rider_entity_1.RiderEntity),
    __metadata("design:type", rider_entity_1.RiderEntity)
], IncidentEntity.prototype, "rider", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], IncidentEntity.prototype, "comments", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], IncidentEntity.prototype, "incidentType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], IncidentEntity.prototype, "couponGenerated", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], IncidentEntity.prototype, "solved", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], IncidentEntity.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => order_entity_1.OrderEntity),
    __metadata("design:type", String)
], IncidentEntity.prototype, "orderId", void 0);
exports.IncidentEntity = IncidentEntity = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'incident' })
], IncidentEntity);
//# sourceMappingURL=incident.entity.js.map