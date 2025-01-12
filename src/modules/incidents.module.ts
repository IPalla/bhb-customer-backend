import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';


import { IncidentController } from 'src/controller/incident.controller';
import { IncidentEntity } from 'src/repository/model/incident.entity';
import { IncidentsService } from 'src/service/incidents.service';

@Module({
  imports: [
    HttpModule,
    SequelizeModule.forFeature([
      IncidentEntity
    ]),
  ],
  providers: [
    IncidentsService
  ],
  controllers: [
    IncidentController
  ],
})
export class IncidentsModule {}
