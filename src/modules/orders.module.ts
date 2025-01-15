import { Module } from '@nestjs/common';
import { OrdersController } from '../controller/orders.controller';
import { OrdersService } from '../service/orders.service';
import { SquareService } from 'src/service/square.service';
import { SquareMapper } from 'src/service/mappers/square.mapper';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, SquareService, SquareMapper],
  exports: [OrdersService]
})
export class OrdersModule {} 