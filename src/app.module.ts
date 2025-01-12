import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config from "./config/config";
import { ProductsModule } from "./modules/products.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    /*SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),*/
    ProductsModule,
  ],
})
export class AppModule {}
/*

    SequelizeModule.forRoot({
      dialect: 'postgres',
      username: 'myUser',
      host: 'localhost',
      database: 'postgres',
      password: 'myPassword',
      port: 5455,
      autoLoadModels: true,
      sync: {},
    }),
*/
