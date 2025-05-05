import { Controller, Get, Logger } from "@nestjs/common";
import { SquareService } from "../service/square.service";
import { Device } from "../model/device";
import { Public } from "src/decorators/public.decorator";

@Controller("bhb-customer-backend/devices")
@Public()
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name);
  constructor(private readonly squareService: SquareService) {}

  @Get()
  async findAll(): Promise<Device[]> {
    this.logger.log("Retrieving all devices");
    const devices = await this.squareService.getDevices();
    this.logger.log("Devices retrieved successfully");
    return devices.map(
      (device) =>
        new Device(
          device?.attributes?.manufacturersId,
          device?.attributes?.name,
          device?.attributes?.model,
          device?.status?.category,
        ),
    );
  }
}
