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
var RidersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RidersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const rider_entity_1 = require("../repository/model/rider.entity");
let RidersService = RidersService_1 = class RidersService {
    constructor(riderModel) {
        this.riderModel = riderModel;
        this.logger = new common_1.Logger(RidersService_1.name);
    }
    async create(createRiderDto) {
        const { password, name, phone } = createRiderDto;
        const rider = await this.riderModel.create({
            password,
            name,
            phone_number: phone,
        });
        return rider.toRider();
    }
    async findAll() {
        const riders = await this.riderModel.findAll();
        return riders.map((riderEntity) => riderEntity.toRider());
    }
    async findOne(id) {
        const rider = await this.riderModel.findOne({
            where: {
                id,
            },
        });
        return rider;
    }
    update(id) {
        return `This action updates a #${id} rider`;
    }
    async remove(id) {
        const rider = await this.findOne(id);
        await rider.destroy();
    }
};
exports.RidersService = RidersService;
exports.RidersService = RidersService = RidersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(rider_entity_1.RiderEntity)),
    __metadata("design:paramtypes", [Object])
], RidersService);
//# sourceMappingURL=riders.service.js.map