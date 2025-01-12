import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  Logger,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth-strategies/jwt.auth.guard';
import { IncidentCreateBody } from 'src/model/incidentCreateBody';
import { IncidentsService } from 'src/service/incidents.service';
import { Incident } from 'src/model/incident';

@Controller('bhb-customer-backend/orders')
export class IncidentController {
  private readonly logger = new Logger(IncidentController.name);
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post(':order_id/incidents')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Request() req,
    @Param('order_id') orderId: string,
    @Body() incident: IncidentCreateBody,
  ): Promise<Incident> {
    this.logger.log(
      `Creating incident for order: ${orderId}. Incident type: ${incident.incidentType}. Incident comments: ${incident.comments}.`,
    );
    return this.incidentsService.storeIncident(incident, orderId, req.user.riderId);
  }
}
