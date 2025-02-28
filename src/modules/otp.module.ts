import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { SequelizeModule } from "@nestjs/sequelize";
import { OtpController } from "../controller/otp.controller";
import { OtpService } from "../service/otp.service";
import { OtpEntity } from "../entity/otp.entity";
import { TwilioService } from "../service/twilio.service";
import { CustomersService } from "src/service/customers.service";
import { SquareModule } from "./square.module";

@Module({
  imports: [
    SequelizeModule.forFeature([OtpEntity]),
    JwtModule.register({
      secret:
        process.env.JWT_KEY ||
        "DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.",
      signOptions: { expiresIn: "24h" },
    }),
    SquareModule,
  ],
  controllers: [OtpController],
  providers: [OtpService, TwilioService, CustomersService],
})
export class OtpModule {}
