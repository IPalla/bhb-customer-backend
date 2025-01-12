import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { Auth } from '../model/auth';
import { AuthService } from '../service/auth.service';
import { JwtToken } from '../model/jwtToken';

@Controller('bhb-customer-backend/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}
  @Post()
  async login(@Body() loginDto: Auth, @Res() res): Promise<JwtToken> {
    return res.status(HttpStatus.OK).json({
      token: await this.authService.validateUserAndLogin(
        loginDto.name,
        loginDto.password,
      ),
    });
  }
}
