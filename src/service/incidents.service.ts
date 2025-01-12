import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../model/order';
import { Status } from '../model/status';
import { EventType } from 'src/model/events';
import { IncidentEntity } from 'src/repository/model/incident.entity';
import { IncidentCreateBody } from 'src/model/incidentCreateBody';
import { Incident } from 'src/model/incident';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);
  constructor(
    @InjectModel(IncidentEntity)
    private readonly incidentModel: typeof IncidentEntity,
  ) {}
  async storeIncident(
    incidentCreateBody: IncidentCreateBody,
    orderId: string,
    createdBy: string,
  ): Promise<Incident> {
    this.logger.log(`Storing new order`);

    if (!orderId) {
      this.logger.error(`Order id is required`);
      throw new HttpException(`Order id is required`, HttpStatus.BAD_REQUEST);
    }
    if (!incidentCreateBody.incidentType) {
      this.logger.error(`Incident type is required`);
      throw new HttpException(
        `Incident type is required`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!incidentCreateBody.comments) {
      this.logger.error(`Incident comments are required`);
      throw new HttpException(
        `Incident comments are required`,
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const incident = await this.incidentModel.create({
        createdBy,
        incidentType: incidentCreateBody.incidentType,
        comments: incidentCreateBody.comments,
        orderId: orderId,
      });

      if (!incident) {
        throw new HttpException(
          'Failed to store incident',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return incident.toIncident();
    } catch (e) {
      this.logger.error(`Error storing the order: ${e.message}`);

      this.logger.error(
        `Errors: ${e?.errors?.map((error) => error.message).join(', ')}`,
      );
      throw new HttpException(
        `Error storing the order: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
