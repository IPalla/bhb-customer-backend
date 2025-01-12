export interface Status {
    createdAt?: string;
    createdAtTs?: number;
    createdBy?: string;
    status?: Status.StatusEnum;
    latitude?: string;
    longitude?: string;
}
export declare namespace Status {
    type StatusEnum = 'PENDING' | 'IN_PROGRESS' | 'PREPARED' | 'READY' | 'IN_DELIVERY' | 'DELIVERED';
    const StatusEnum: {
        PENDING: StatusEnum;
        IN_PROGRESS: StatusEnum;
        PREPARED: StatusEnum;
        READY: StatusEnum;
        IN_DELIVERY: StatusEnum;
        DELIVERED: StatusEnum;
    };
}
