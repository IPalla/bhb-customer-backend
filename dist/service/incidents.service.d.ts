import { IncidentEntity } from 'src/repository/model/incident.entity';
import { IncidentCreateBody } from 'src/model/incidentCreateBody';
import { Incident } from 'src/model/incident';
export declare class IncidentsService {
    private readonly incidentModel;
    private readonly logger;
    constructor(incidentModel: typeof IncidentEntity);
    storeIncident(incidentCreateBody: IncidentCreateBody, orderId: string, createdBy: string): Promise<Incident>;
}
