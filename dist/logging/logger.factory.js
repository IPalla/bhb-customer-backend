"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerFactory = void 0;
const winston_1 = require("winston");
const nest_winston_1 = require("nest-winston");
const LoggerFactory = (appName) => {
    let consoleFormat;
    const DEBUG = process.env.DEBUG;
    const USE_JSON_LOGGER = process.env.USE_JSON_LOGGER;
    if (USE_JSON_LOGGER === 'true') {
        consoleFormat = winston_1.format.combine(winston_1.format.ms(), winston_1.format.timestamp(), winston_1.format.json());
    }
    else {
        consoleFormat = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.ms(), nest_winston_1.utilities.format.nestLike(appName, {
            colors: true,
            prettyPrint: true,
        }));
    }
    return nest_winston_1.WinstonModule.createLogger({
        level: DEBUG ? 'debug' : 'info',
        transports: [new winston_1.transports.Console({ format: consoleFormat })],
    });
};
exports.LoggerFactory = LoggerFactory;
//# sourceMappingURL=logger.factory.js.map