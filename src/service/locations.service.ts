import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { LocationEntity } from "../entity/location.entity";
import { OpeningHoursEntity } from "../entity/opening-hours.entity";
import { CreateLocationDto } from "../dto/create-location.dto";
import { Sequelize } from "sequelize-typescript";

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(LocationEntity)
    private readonly locationModel: typeof LocationEntity,
    @InjectModel(OpeningHoursEntity)
    private readonly openingHoursModel: typeof OpeningHoursEntity,
    private readonly sequelize: Sequelize,
  ) {}

  async getAllLocations(): Promise<LocationEntity[]> {
    return this.locationModel.findAll({
      include: [OpeningHoursEntity],
    });
  }

  async createLocation(
    locationData: CreateLocationDto,
  ): Promise<LocationEntity> {
    const { opening_hours, ...locationFields } = locationData;

    const result = await this.sequelize.transaction(async (t) => {
      const location = await this.locationModel.create(locationFields, {
        transaction: t,
      });

      const openingHoursPromises = opening_hours.map((hours) =>
        this.openingHoursModel.create(
          {
            ...hours,
            locationId: location.id,
          },
          { transaction: t },
        ),
      );

      await Promise.all(openingHoursPromises);

      return location;
    });

    return this.locationModel.findByPk(result.id, {
      include: [OpeningHoursEntity],
    });
  }

  async updateStoreStatus(
    squareLocationId: string,
    isClosed: boolean,
  ): Promise<LocationEntity> {
    const location = await this.locationModel.findOne({
      where: { square_location_id: squareLocationId },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    await location.update({ high_demand: isClosed });
    return location;
  }
}
