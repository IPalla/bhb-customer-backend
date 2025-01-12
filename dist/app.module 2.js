"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const orders_module_1 = require("./modules/orders.module");
const auth_module_1 = require("./modules/auth.module");
const sequelize_1 = require("@nestjs/sequelize");
const riders_module_1 = require("./modules/riders.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const config_2 = require("./config/config");
const incidents_module_1 = require("./modules/incidents.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            config_1.ConfigModule.forRoot({
                load: [config_2.default],
                isGlobal: true,
            }),
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => configService.get('database'),
            }),
            orders_module_1.OrdersModule,
            auth_module_1.AuthModule,
            riders_module_1.RidersModule,
            incidents_module_1.IncidentsModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map