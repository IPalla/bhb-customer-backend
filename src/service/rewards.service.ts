import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { ClaimRewardDto } from "src/dto/claim-reward.dto";
import { RewardDto } from "src/dto/reward.dto";
import { Order as OrderModel } from "src/model/order";

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly ORDER_TYPE_MAP: Record<OrderModel.TypeEnum, string> = {
    Delivery: "delivery",
    Pickup: "pickup",
    Dinein: "dine-in",
  };

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>("rewards.baseUrl");
    this.apiKey = this.configService.get<string>("rewards.apiKey");
  }

  async validateReward({
    claimRewardDto,
    customerPhone,
    orderType,
  }: {
    claimRewardDto: ClaimRewardDto;
    customerPhone: string;
    orderType?: OrderModel.TypeEnum;
  }): Promise<RewardDto> {
    this.logger.log(
      `Validating reward: rewardId=${claimRewardDto.reward_id}, customerPhone=${customerPhone}, orderType=${orderType}`,
    );
    return await this.fetchReward({
      claimRewardDto,
      mode: "validate",
      rewardId: claimRewardDto.reward_id,
      customerPhone,
      orderType,
    });
  }

  async claimReward({
    claimRewardDto,
    customerPhone,
    orderType,
    orderId,
  }: {
    claimRewardDto: ClaimRewardDto;
    customerPhone: string;
    orderType?: OrderModel.TypeEnum;
    orderId?: string;
  }): Promise<RewardDto> {
    this.logger.log(
      `Claiming reward: rewardId=${claimRewardDto.reward_id}, customerPhone=${customerPhone}, orderType=${orderType}, orderId=${orderId}`,
    );
    return await this.fetchReward({
      claimRewardDto,
      mode: "claim",
      rewardId: claimRewardDto.reward_id,
      customerPhone,
      orderType,
      orderId,
    });
  }

  async fetchReward({
    claimRewardDto,
    mode,
    rewardId,
    customerPhone,
    orderId,
    orderType,
  }: {
    claimRewardDto: ClaimRewardDto;
    mode: "validate" | "claim";
    rewardId: string;
    customerPhone: string;
    orderId?: string;
    orderType?: OrderModel.TypeEnum;
  }): Promise<RewardDto> {
    try {
      let url = `${this.baseUrl}/rewards/${rewardId}/${mode}?customer_phone=${encodeURIComponent(customerPhone)}`;
      if (orderType) {
        url += `&order_type=${encodeURIComponent(this.ORDER_TYPE_MAP[orderType])}`;
      }
      if (orderId) {
        url += `&order_id=${encodeURIComponent(orderId)}`;
      }
      this.logger.log(`[${mode}] Fetching reward from URL: ${url}`);
      const response = await axios.post<RewardDto>(url, claimRewardDto, {
        headers: {
          Accept: "application/json",
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to ${mode} reward:`, error);
      if (error.response) {
        this.logger.error(
          `Rewards API error response: ${JSON.stringify(error.response.data)}`,
        );
        throw new BadRequestException(
          error.response.data?.message || `Failed to ${mode} reward`,
        );
      }
      throw new InternalServerErrorException(`Failed to ${mode} reward`);
    }
  }
}
