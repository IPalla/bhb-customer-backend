import { IncidentCreateBody } from 'src/model/incidentCreateBody';
import { IncidentsService } from 'src/service/incidents.service';
import { Incident } from 'src/model/incident';
export declare class IncidentController {
    private readonly incidentsService;
    private readonly logger;
    constructor(incidentsService: IncidentsService);
    updateOrderStatus(req: any, orderId: string, incident: IncidentCreateBody): Promise<Incident>;
}
