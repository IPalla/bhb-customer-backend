import { Controller, Get, Post, Body } from "@nestjs/common";
import { LocationsService } from "../service/locations.service";
import { LocationEntity } from "../entity/location.entity";
import { CreateLocationDto } from "../dto/create-location.dto";
import { Public } from "src/decorators/public.decorator";

@Controller("bhb-customer-backend/locations")
@Public()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAllLocations(): Promise<LocationEntity[]> {
    return this.locationsService.getAllLocations();
  }

  @Post()
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<LocationEntity> {
    return this.locationsService.createLocation(createLocationDto);
  }
}
