import { RiderEntity } from '../repository/model/rider.entity';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly riderModel;
    private readonly jwtService;
    private readonly logger;
    constructor(riderModel: typeof RiderEntity, jwtService: JwtService);
    validateUser(name: string, password: string): Promise<RiderEntity>;
    login(rider: RiderEntity): Promise<{
        jwt: string;
    }>;
    validateUserAndLogin(name: string, password: string): Promise<String>;
}
