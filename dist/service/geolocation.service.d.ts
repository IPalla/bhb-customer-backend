import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class GeoLocationService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private GOOGLE_MAPS_API_KEY;
    private BITE_HOUSE_PICKUP_POINT;
    private MAX_ALLOWED_DISTANCE;
    constructor(configService: ConfigService, httpService: HttpService);
    getCoordinatesFromADdress(address: string): Promise<{
        latitude: number;
        longitude: number;
    }>;
    verifyDeliveryDistance(coordinates: {
        latitude: string;
        longitude: string;
    }, coordinates2: {
        latitude: string;
        longitude: string;
    }): void;
    verifyInDeliveryDistance(coordinates: {
        latitude: string;
        longitude: string;
    }): void;
    private getDistanceInMetersBetweenCoordinates;
    private getDistance;
    private toRadians;
}
