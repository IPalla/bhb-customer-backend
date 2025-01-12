import { Auth } from '../model/auth';
import { AuthService } from '../service/auth.service';
import { JwtToken } from '../model/jwtToken';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(loginDto: Auth, res: any): Promise<JwtToken>;
}
