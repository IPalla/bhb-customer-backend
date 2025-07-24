import { Module } from "@nestjs/common";
import { RewardsService } from "../service/rewards.service";

@Module({
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
