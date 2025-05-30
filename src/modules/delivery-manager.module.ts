import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { DeliveryManagerService } from "../service/delivery-manager.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [DeliveryManagerService],
  exports: [DeliveryManagerService],
})
export class DeliveryManagerModule {}
