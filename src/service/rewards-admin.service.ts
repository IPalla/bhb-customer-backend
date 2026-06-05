import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class RewardsAdminService {
  private readonly logger = new Logger(RewardsAdminService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>("rewards.baseUrl");
    this.apiKey = this.configService.get<string>("rewards.apiKey");
  }

  private get headers() {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };
  }

  private handleError(error: unknown, action: string): never {
    this.logger.error(`Rewards admin ${action} failed`, error);
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as {
        message?: string;
        errors?: string[];
      };
      const detail = data?.errors?.length
        ? `${data.message}: ${data.errors.join("; ")}`
        : data?.message;
      throw new BadRequestException(detail || `Failed to ${action}`);
    }
    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  async listRewards<T>(): Promise<T[]> {
    try {
      const response = await axios.get<T[]>(`${this.baseUrl}/rewards/manage`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, "list rewards");
    }
  }

  async getReward<T>(rewardId: string): Promise<T> {
    try {
      const response = await axios.get<T>(
        `${this.baseUrl}/rewards/manage/${rewardId}`,
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "get reward");
    }
  }

  async createReward<T>(body: unknown): Promise<T> {
    try {
      const response = await axios.post<T>(`${this.baseUrl}/rewards`, body, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, "create reward");
    }
  }

  async updateReward<T>(rewardId: string, body: unknown): Promise<T> {
    try {
      const response = await axios.put<T>(
        `${this.baseUrl}/rewards/manage/${rewardId}`,
        body,
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "update reward");
    }
  }

  async deleteReward(rewardId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/rewards/manage/${rewardId}`, {
        headers: this.headers,
      });
    } catch (error) {
      this.handleError(error, "delete reward");
    }
  }

  async listTiers<T>(): Promise<T[]> {
    try {
      const response = await axios.get<T[]>(`${this.baseUrl}/tiers`);
      return response.data;
    } catch (error) {
      this.handleError(error, "list tiers");
    }
  }
}
