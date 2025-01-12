import { RidersService } from '../service/riders.service';
import { CreateRider } from '../model/create.rider';
import { Rider } from '../model/rider';
export declare class RidersController {
    private readonly ridersService;
    private readonly logger;
    constructor(ridersService: RidersService);
    create(createRiderDto: CreateRider): Promise<Rider>;
    findAll(): Promise<Rider[]>;
    findOne(id: string): void;
    update(id: string): void;
    remove(id: string): Promise<void>;
}
