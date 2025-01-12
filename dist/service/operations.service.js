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
var OperationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const operation_entity_1 = require("../repository/model/operation.entity");
let OperationsService = OperationsService_1 = class OperationsService {
    constructor(operationmodel) {
        this.operationmodel = operationmodel;
        this.logger = new common_1.Logger(OperationsService_1.name);
    }
    async updateOperation(operationId, operation) {
        this.logger.log(`Updating operation: ${operationId}`);
        const existingOperation = await this.operationmodel.findByPk(operationId);
        if (!existingOperation) {
            this.logger.error('Operation not found');
        }
        const updatedOperation = { ...existingOperation, ...operation };
        await existingOperation.update(updatedOperation);
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = OperationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(operation_entity_1.OperationEntity)),
    __metadata("design:paramtypes", [Object])
], OperationsService);
//# sourceMappingURL=operations.service.js.map