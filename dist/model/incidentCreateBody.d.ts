export interface IncidentCreateBody {
    comments?: string;
    incidentType?: IncidentCreateBody.IncidentTypeEnum;
}
export declare namespace IncidentCreateBody {
    type IncidentTypeEnum = 'Kitchen' | 'Delivery' | 'Client';
    const IncidentTypeEnum: {
        Kitchen: IncidentTypeEnum;
        Delivery: IncidentTypeEnum;
        Client: IncidentTypeEnum;
    };
}
