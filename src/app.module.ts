import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config from "./config/config";
import { ProductsModule } from "./modules/products.module";
import { OrdersModule } from "./modules/orders.module";
import { OtpModule } from "./modules/otp.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { JwtGuard } from "./guards/jwt.guard";
import { CategoriesModule } from "./modules/categories.module";
import { CustomerModule } from "./modules/customer.module";
import { LocationsModule } from "./modules/locations.module";
import { SquareModule } from "./modules/square.module";
import { OrderPaymentCheckoutModule } from "./modules/order-payment-checkout.module";
import { DeliveryManagerModule } from "./modules/delivery-manager.module";
import { CouponModule } from "./modules/coupon.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get("database"),
    }),
    SquareModule,
    ProductsModule,
    OrdersModule,
    CustomerModule,
    LocationsModule,
    OtpModule,
    CategoriesModule,
    OrderPaymentCheckoutModule,
    DeliveryManagerModule,
    CouponModule,
    JwtModule.register({
      secret:
        process.env.JWT_KEY ||
        "DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.",
      signOptions: { expiresIn: "24h" },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
