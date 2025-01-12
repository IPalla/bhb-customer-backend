import { CreateRider } from '../model/create.rider';
import { Rider } from '../model/rider';
import { RiderEntity } from '../repository/model/rider.entity';
export declare class RidersService {
    private readonly riderModel;
    private readonly logger;
    constructor(riderModel: typeof RiderEntity);
    create(createRiderDto: CreateRider): Promise<Rider>;
    findAll(): Promise<Rider[]>;
    findOne(id: string): Promise<RiderEntity>;
    update(id: number): string;
    remove(id: string): Promise<void>;
}
