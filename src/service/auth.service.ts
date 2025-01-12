import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RiderEntity } from '../repository/model/rider.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(RiderEntity)
    private readonly riderModel: typeof RiderEntity,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(name: string, password: string): Promise<RiderEntity> {
    this.logger.log(`Authenticating user : ${name}`);
    const rider: RiderEntity = await this.riderModel.findOne({
      where: {
        name,
        password,
      },
    });
    if (!rider) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return rider;
  }

  async login(rider: RiderEntity) {
    const payload = { rider: rider.name, sub: rider.id };
    return {
      jwt: this.jwtService.sign(payload),
    };
  }

  async validateUserAndLogin(name: string, password: string): Promise<String> {
    var rider = await this.validateUser(name, password);
    var jwt = await this.login(rider);
    return jwt.jwt;
  }
}
