import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client, Environment, ApiError, CatalogObject } from "square";

@Injectable()
export class SquareService {
  private readonly logger = new Logger(SquareService.name);
  private client: Client;
  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      bearerAuthCredentials: {
        accessToken: this.configService.getOrThrow("square.accessToken"),
      },
      environment: this.configService.getOrThrow("square.isSandbox") ? Environment.Sandbox : Environment.Production,
    });
  }

  async getProducts(): Promise<CatalogObject[]> {
    this.logger.log("Retrieving products from Square");
    try {
      const response = await this.client.catalogApi.listCatalog(undefined, "ITEM,IMAGE,MODIFIER_LIST");
      return response.result.objects;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error("Errors returned by the API: ", error.errors);
      } else {
        console.error("Unexpected error: ", error);
      }
    }
  }
}
