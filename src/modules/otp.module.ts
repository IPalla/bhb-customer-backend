import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { OtpController } from '../controller/otp.controller';
import { OtpService } from '../service/otp.service';
import { OtpEntity } from '../entity/otp.entity';
import { TwilioService } from '../service/twilio.service';
import { CustomersService } from 'src/service/customers.service';
import { SquareService } from 'src/service/square.service';
import { SquareMapper } from 'src/service/mappers/square.mapper';

@Module({
  imports: [
    SequelizeModule.forFeature([OtpEntity]),
    JwtModule.register({
      secret: process.env.JWT_KEY || 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [OtpController],
  providers: [
    OtpService,
    TwilioService,
    CustomersService,
    SquareService,
    SquareMapper,
  ],
})
export class OtpModule {}
