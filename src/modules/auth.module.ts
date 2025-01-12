import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtStrategy } from '../auth-strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';

import { RiderEntity } from '../repository/model/rider.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([RiderEntity]),
    PassportModule,
    JwtModule.register({
      secret:
        // TODO change this secret
        'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
      signOptions: { expiresIn: '1 days' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
