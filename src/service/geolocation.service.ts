import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeoLocationService {
  private readonly logger = new Logger(GeoLocationService.name);
  private GOOGLE_MAPS_API_KEY: string;
  private BITE_HOUSE_PICKUP_POINT: { latitude: string; longitude: string } = {
    latitude: '40.605825',
    longitude: '-3.7175674',
  };
  private MAX_ALLOWED_DISTANCE: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    if (!this.configService.get('google.mapsApiKey')) {
      throw new Error('Missing configuration property: google.mapsApiKey');
    }
    this.GOOGLE_MAPS_API_KEY = this.configService.get('google.mapsApiKey');
    if (this.configService.get('maxAllowedDistance')) {
      this.MAX_ALLOWED_DISTANCE = this.configService.get('maxAllowedDistance');
    }
  }

  async getCoordinatesFromADdress(
    address: string,
  ): Promise<{ latitude: number; longitude: number }> {
    this.logger.log(`Geolocating address: ${address}`);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${this.GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await this.httpService.axiosRef.get(url);
      const data = response.data;
      if (response.status === 200) {
        const location = data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      } else {
        throw new Error('Error geolocating address, response: ' + data.status);
      }
    } catch (error) {
      this.logger.error('Error geolocating address: ' + error);
      return { latitude: 0, longitude: 0 };
    }
  }

  verifyDeliveryDistance(
    coordinates: { latitude: string; longitude: string },
    coordinates2: { latitude: string; longitude: string },
  ): void {
    this.logger.log(`Verifying distance between delivery point and rider.`);
    const distance = this.getDistanceInMetersBetweenCoordinates(
      coordinates2,
      coordinates,
    );
    if (distance > this.MAX_ALLOWED_DISTANCE) {
      this.logger.error(
        `Distance between rider and delivery point exceeds maximum allowed distance: ${distance}`,
      );
      throw new HttpException(
        `Distance between rider and delivery point exceeds maximum allowed distance: ${distance}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  verifyInDeliveryDistance(coordinates: {
    latitude: string;
    longitude: string;
  }): void {
    this.logger.log(`Verifying distance between pickup point and rider.`);
    const distance = this.getDistanceInMetersBetweenCoordinates(
      this.BITE_HOUSE_PICKUP_POINT,
      coordinates,
    );
    if (distance > this.MAX_ALLOWED_DISTANCE) {
      this.logger.error(
        `Distance exceeds maximum allowed distance: ${distance}`,
      );
      throw new HttpException(
        `Distance exceeds maximum allowed distance: ${distance}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private getDistanceInMetersBetweenCoordinates(
    coordinates1: { latitude: string; longitude: string },
    coordinates2: { latitude: string; longitude: string },
  ): number {
    // Validate that coordinates 1 and coordinates 2 objects are valid
    if (
      !coordinates1 ||
      !coordinates2 ||
      !coordinates1.latitude ||
      !coordinates1.longitude ||
      !coordinates2.latitude ||
      !coordinates2.longitude
    ) {
      this.logger.error('Invalid coordinates');
      return 0;
    }
    return this.getDistance(
      {
        latitude: Number(coordinates1.latitude),
        longitude: Number(coordinates1.longitude),
      },
      {
        latitude: Number(coordinates2.latitude),
        longitude: Number(coordinates2.longitude),
      },
    );
  }

  private getDistance(
    startCoords: { latitude: number; longitude: number },
    endCoords: { latitude: number; longitude: number },
  ): number {
    const earthRadius = 6371;

    const dLat = this.toRadians(endCoords.latitude - startCoords.latitude);
    const dLng = this.toRadians(endCoords.longitude - startCoords.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(startCoords.latitude)) *
        Math.cos(this.toRadians(endCoords.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadius * c;

    return distance * 1000;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
