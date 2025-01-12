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
var IncidentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const incident_entity_1 = require("../repository/model/incident.entity");
let IncidentsService = IncidentsService_1 = class IncidentsService {
    constructor(incidentModel) {
        this.incidentModel = incidentModel;
        this.logger = new common_1.Logger(IncidentsService_1.name);
    }
    async storeIncident(incidentCreateBody, orderId, createdBy) {
        this.logger.log(`Storing new order`);
        if (!orderId) {
            this.logger.error(`Order id is required`);
            throw new common_1.HttpException(`Order id is required`, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!incidentCreateBody.incidentType) {
            this.logger.error(`Incident type is required`);
            throw new common_1.HttpException(`Incident type is required`, common_1.HttpStatus.BAD_REQUEST);
        }
        if (!incidentCreateBody.comments) {
            this.logger.error(`Incident comments are required`);
            throw new common_1.HttpException(`Incident comments are required`, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const incident = await this.incidentModel.create({
                createdBy,
                incidentType: incidentCreateBody.incidentType,
                comments: incidentCreateBody.comments,
                orderId: orderId,
            });
            if (!incident) {
                throw new common_1.HttpException('Failed to store incident', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return incident.toIncident();
        }
        catch (e) {
            this.logger.error(`Error storing the order: ${e.message}`);
            this.logger.error(`Errors: ${e?.errors?.map((error) => error.message).join(', ')}`);
            throw new common_1.HttpException(`Error storing the order: ${e.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = IncidentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(incident_entity_1.IncidentEntity)),
    __metadata("design:paramtypes", [Object])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map