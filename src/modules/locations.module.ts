import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LocationEntity } from "src/entity/location.entity";
import { OpeningHoursEntity } from "src/entity/opening-hours.entity";
import { DeliveryOpeningHoursEntity } from "src/entity/delivery-opening-hours.entity";
import { LocationsController } from "src/controller/locations.controller";
import { LocationsService } from "src/service/locations.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      LocationEntity,
      OpeningHoursEntity,
      DeliveryOpeningHoursEntity,
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
