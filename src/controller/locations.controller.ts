import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { LocationsService } from "../service/locations.service";
import { LocationEntity } from "../entity/location.entity";
import { CreateLocationDto } from "../dto/create-location.dto";
import { Public } from "src/decorators/public.decorator";
import { ConfigService } from "@nestjs/config";

@Controller("bhb-customer-backend/locations")
@Public()
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);
  private readonly apiKey: string;

  constructor(
    private readonly locationsService: LocationsService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>("close.apiKey");
  }

  @Get()
  async getAllLocations(): Promise<LocationEntity[]> {
    return this.locationsService.getAllLocations();
  }

  @Get(":squareLocationId/:status")
  async updateStoreStatus(
    @Param("squareLocationId") squareLocationId: string,
    @Param("status") status: string,
    @Query("api-key") apiKey: string,
  ): Promise<LocationEntity> {
    if (apiKey !== this.apiKey) {
      this.logger.warn(
        `Unauthorized attempt to update store status with API key: ${apiKey}`,
      );
      throw new UnauthorizedException("Invalid API key");
    }

    this.logger.log(
      `Updating store status for location ${squareLocationId} to ${status}`,
    );
    const isClosed = status.toLowerCase() === "close";
    const result = await this.locationsService.updateStoreStatus(
      squareLocationId,
      isClosed,
    );
    this.logger.log(
      `Store status updated successfully for location ${squareLocationId}`,
    );
    return result;
  }

  @Post()
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<LocationEntity> {
    return this.locationsService.createLocation(createLocationDto);
  }
}
