export interface Incident {
    createdAt?: string;
    createdBy?: string;
    comments?: string;
    incidentType?: Incident.IncidentTypeEnum;
    couponGenerated?: boolean;
    solved?: boolean;
    orderId?: string;
}
export declare namespace Incident {
    type IncidentTypeEnum = 'Kitchen' | 'Delivery' | 'Client';
    const IncidentTypeEnum: {
        Kitchen: IncidentTypeEnum;
        Delivery: IncidentTypeEnum;
        Client: IncidentTypeEnum;
    };
}
