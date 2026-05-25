import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { LocationEntity } from "../entity/location.entity";
import { OpeningHoursEntity } from "../entity/opening-hours.entity";
import { DeliveryOpeningHoursEntity } from "../entity/delivery-opening-hours.entity";
import { CreateLocationDto } from "../dto/create-location.dto";
import { OpeningHoursDto } from "../dto/opening-hours.dto";
import { Sequelize } from "sequelize-typescript";
import { Transaction } from "sequelize";

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectModel(LocationEntity)
    private readonly locationModel: typeof LocationEntity,
    @InjectModel(OpeningHoursEntity)
    private readonly openingHoursModel: typeof OpeningHoursEntity,
    @InjectModel(DeliveryOpeningHoursEntity)
    private readonly deliveryOpeningHoursModel: typeof DeliveryOpeningHoursEntity,
    private readonly sequelize: Sequelize,
  ) {}

  async getAllLocations(): Promise<LocationEntity[]> {
    this.logger.log("getAllLocations start");
    const locations = await this.locationModel.findAll({
      include: [OpeningHoursEntity, DeliveryOpeningHoursEntity],
    });
    this.logger.log(`getAllLocations end count=${locations.length}`);
    return locations;
  }

  async createLocation(
    locationData: CreateLocationDto,
  ): Promise<LocationEntity> {
    this.logger.log("createLocation start");
    const { opening_hours, delivery_opening_hours, ...locationFields } =
      locationData;

    const result = await this.sequelize.transaction(async (t) => {
      const location = await this.locationModel.create(locationFields, {
        transaction: t,
      });

      await this.createHoursRecords(
        this.openingHoursModel,
        opening_hours,
        location.square_location_id,
        t,
      );

      if (delivery_opening_hours?.length) {
        await this.createHoursRecords(
          this.deliveryOpeningHoursModel,
          delivery_opening_hours,
          location.square_location_id,
          t,
        );
      }

      return location;
    });

    const created = await this.locationModel.findByPk(
      result.square_location_id,
      {
        include: [OpeningHoursEntity, DeliveryOpeningHoursEntity],
      },
    );
    this.logger.log("createLocation end");
    return created;
  }

  async updateStoreStatus(
    squareLocationId: string,
    isClosed: boolean,
  ): Promise<LocationEntity> {
    this.logger.log(
      `updateStoreStatus start squareLocationId=${squareLocationId} isClosed=${isClosed}`,
    );
    const location = await this.locationModel.findOne({
      where: { square_location_id: squareLocationId },
      include: [OpeningHoursEntity, DeliveryOpeningHoursEntity],
    });

    if (!location) {
      throw new Error("Location not found");
    }

    await location.update({ high_demand: isClosed });
    this.logger.log("updateStoreStatus end");
    return location;
  }

  private async createHoursRecords(
    model: typeof OpeningHoursEntity | typeof DeliveryOpeningHoursEntity,
    hours: OpeningHoursDto[],
    squareLocationId: string,
    transaction: Transaction,
  ): Promise<void> {
    await Promise.all(
      hours.map((entry) =>
        model.create(
          {
            ...entry,
            square_location_id: squareLocationId,
          },
          { transaction },
        ),
      ),
    );
  }
}
