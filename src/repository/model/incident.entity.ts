import {
    Column,
    Model,
    Table,
    PrimaryKey,
    Default,
    DataType,
    BelongsTo,
    ForeignKey,
  } from 'sequelize-typescript';
  import { OrderEntity } from './order.entity';
import { Incident } from 'src/model/incident';
import { RiderEntity } from './rider.entity';
  
  @Table({ tableName: 'incident' })
  export class IncidentEntity extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id: string;
    @ForeignKey(()=>RiderEntity)
    createdBy: string;
    @BelongsTo(() => RiderEntity)
    rider: RiderEntity;
    @Column(DataType.STRING)
    comments: string;
    @Column(DataType.STRING)
    incidentType: string;
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    couponGenerated: boolean;
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    solved: boolean;
    @BelongsTo(() => OrderEntity)
    order: OrderEntity;
    @ForeignKey(() => OrderEntity)
    orderId: string;
  
    toIncident(): Incident {
      const incident: Incident = {
        createdAt: this.createdAt,
        createdBy: this.createdBy,
        comments: this.comments,
        incidentType: Incident.IncidentTypeEnum[this.incidentType],
        couponGenerated: this.couponGenerated,
        solved: this.solved,
        orderId: this.orderId
      };
      return incident;
    }
  }
  