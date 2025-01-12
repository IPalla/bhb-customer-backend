import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRider } from '../model/create.rider';
import { Rider } from '../model/rider';
import { RiderEntity } from '../repository/model/rider.entity';

@Injectable()
export class RidersService {
  private readonly logger = new Logger(RidersService.name);
  constructor(
    @InjectModel(RiderEntity)
    private readonly riderModel: typeof RiderEntity,
  ) {}

  async create(createRiderDto: CreateRider): Promise<Rider> {
    const { password, name, phone } = createRiderDto;
    const rider: RiderEntity = await this.riderModel.create({
      password,
      name,
      phone_number: phone,
    });
    return rider.toRider();
  }

  async findAll(): Promise<Rider[]> {
    const riders = await this.riderModel.findAll();
    return riders.map((riderEntity) => riderEntity.toRider());
  }

  async findOne(id: string): Promise<RiderEntity> {
    const rider = await this.riderModel.findOne({
      where: {
        id,
      },
    });
    return rider;
  }

  update(id: number) {
    return `This action updates a #${id} rider`;
  }

  async remove(id: string): Promise<void> {
    const rider = await this.findOne(id);
    await rider.destroy();
  }
}
