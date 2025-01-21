import { Controller, Put, Body, Logger, Req } from "@nestjs/common";
import { CustomersService } from "../service/customers.service";
import { Customer } from "src/model/customer";
import { RequestWithUser } from "src/guards/jwt.guard";

@Controller("bhb-customer-backend/customers")
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Put()
  async updateCustomer(
    @Req() request: RequestWithUser,
    @Body() customerData: Customer,
  ): Promise<Customer> {
    const toUpdateCustomer: Customer = {
      phoneNumber:
        customerData.phoneNumber || request.user?.customer?.phoneNumber,
      id: request.user?.customer?.id,
      email: customerData.email || request.user?.customer?.email,
      firstName: customerData.firstName || request.user?.customer?.firstName,
      lastName: customerData.lastName || request.user?.customer?.lastName,
      address: {
        street:
          customerData.address?.street ||
          request.user?.customer?.address?.street,
      },
    };
    this.logger.log(`Updating customer with ID: ${toUpdateCustomer.id}`);
    return this.customersService.updateCustomer(toUpdateCustomer);
  }
}
