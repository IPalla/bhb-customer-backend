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
var GeoLocationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoLocationService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GeoLocationService = GeoLocationService_1 = class GeoLocationService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(GeoLocationService_1.name);
        this.BITE_HOUSE_PICKUP_POINT = {
            latitude: '40.605825',
            longitude: '-3.7175674',
        };
        if (!this.configService.get('google.mapsApiKey')) {
            throw new Error('Missing configuration property: google.mapsApiKey');
        }
        this.GOOGLE_MAPS_API_KEY = this.configService.get('google.mapsApiKey');
        if (this.configService.get('maxAllowedDistance')) {
            this.MAX_ALLOWED_DISTANCE = this.configService.get('maxAllowedDistance');
        }
    }
    async getCoordinatesFromADdress(address) {
        this.logger.log(`Geolocating address: ${address}`);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.GOOGLE_MAPS_API_KEY}`;
        try {
            const response = await this.httpService.axiosRef.get(url);
            const data = response.data;
            if (response.status === 200) {
                const location = data.results[0].geometry.location;
                return { latitude: location.lat, longitude: location.lng };
            }
            else {
                throw new Error('Error geolocating address, response: ' + data.status);
            }
        }
        catch (error) {
            this.logger.error('Error geolocating address: ' + error);
            return { latitude: 0, longitude: 0 };
        }
    }
    verifyDeliveryDistance(coordinates, coordinates2) {
        this.logger.log(`Verifying distance between delivery point and rider.`);
        const distance = this.getDistanceInMetersBetweenCoordinates(coordinates2, coordinates);
        if (distance > this.MAX_ALLOWED_DISTANCE) {
            this.logger.error(`Distance between rider and delivery point exceeds maximum allowed distance: ${distance}`);
            throw new common_1.HttpException(`Distance between rider and delivery point exceeds maximum allowed distance: ${distance}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    verifyInDeliveryDistance(coordinates) {
        this.logger.log(`Verifying distance between pickup point and rider.`);
        const distance = this.getDistanceInMetersBetweenCoordinates(this.BITE_HOUSE_PICKUP_POINT, coordinates);
        if (distance > this.MAX_ALLOWED_DISTANCE) {
            this.logger.error(`Distance exceeds maximum allowed distance: ${distance}`);
            throw new common_1.HttpException(`Distance exceeds maximum allowed distance: ${distance}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getDistanceInMetersBetweenCoordinates(coordinates1, coordinates2) {
        if (!coordinates1 ||
            !coordinates2 ||
            !coordinates1.latitude ||
            !coordinates1.longitude ||
            !coordinates2.latitude ||
            !coordinates2.longitude) {
            this.logger.error('Invalid coordinates');
            return 0;
        }
        return this.getDistance({
            latitude: Number(coordinates1.latitude),
            longitude: Number(coordinates1.longitude),
        }, {
            latitude: Number(coordinates2.latitude),
            longitude: Number(coordinates2.longitude),
        });
    }
    getDistance(startCoords, endCoords) {
        const earthRadius = 6371;
        const dLat = this.toRadians(endCoords.latitude - startCoords.latitude);
        const dLng = this.toRadians(endCoords.longitude - startCoords.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(startCoords.latitude)) *
                Math.cos(this.toRadians(endCoords.latitude)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        return distance * 1000;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.GeoLocationService = GeoLocationService;
exports.GeoLocationService = GeoLocationService = GeoLocationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], GeoLocationService);
//# sourceMappingURL=geolocation.service.js.map