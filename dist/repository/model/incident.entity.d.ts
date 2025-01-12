import { Model } from 'sequelize-typescript';
import { OrderEntity } from './order.entity';
import { Incident } from 'src/model/incident';
import { RiderEntity } from './rider.entity';
export declare class IncidentEntity extends Model {
    id: string;
    createdBy: string;
    rider: RiderEntity;
    comments: string;
    incidentType: string;
    couponGenerated: boolean;
    solved: boolean;
    order: OrderEntity;
    orderId: string;
    toIncident(): Incident;
}
