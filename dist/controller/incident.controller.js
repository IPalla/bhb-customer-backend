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
var IncidentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth-strategies/jwt.auth.guard");
const incidentCreateBody_1 = require("../model/incidentCreateBody");
const incidents_service_1 = require("../service/incidents.service");
let IncidentController = IncidentController_1 = class IncidentController {
    constructor(incidentsService) {
        this.incidentsService = incidentsService;
        this.logger = new common_1.Logger(IncidentController_1.name);
    }
    async updateOrderStatus(req, orderId, incident) {
        this.logger.log(`Creating incident for order: ${orderId}. Incident type: ${incident.incidentType}. Incident comments: ${incident.comments}.`);
        return this.incidentsService.storeIncident(incident, orderId, req.user.riderId);
    }
};
exports.IncidentController = IncidentController;
__decorate([
    (0, common_1.Post)(':order_id/incidents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('order_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "updateOrderStatus", null);
exports.IncidentController = IncidentController = IncidentController_1 = __decorate([
    (0, common_1.Controller)('bhb-customer-backend/orders'),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentController);
//# sourceMappingURL=incident.controller.js.map