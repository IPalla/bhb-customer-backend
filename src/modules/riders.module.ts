import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RiderEntity } from '../repository/model/rider.entity';
import { RidersService } from '../service/riders.service';
import { RidersController } from '../controller/riders.controller';

@Module({
  imports: [SequelizeModule.forFeature([RiderEntity])],
  controllers: [RidersController],
  providers: [RidersService],
})
export class RidersModule {}
