import { Controller, Put, Body, Logger, Req, Get, NotFoundException } from "@nestjs/common";
import { CustomersService } from "../service/customers.service";
import { Customer } from "src/model/customer";
import { RequestWithUser } from "src/guards/jwt.guard";

@Controller("bhb-customer-backend/customers")
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}
  
  @Get()
  async getCustomer(@Req() request: RequestWithUser): Promise<Customer> {
    const customerId = request.user?.customer?.id;
    this.logger.log(`Fetching customer with ID: ${customerId}`);
    const customer = await this.customersService.getCustomer(customerId);
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }

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
        address_line_1:
          customerData.address?.address_line_1 ||
          request.user?.customer?.address?.address_line_1,
        address_line_2:
          customerData.address?.address_line_2 ||
          request.user?.customer?.address?.address_line_2,
        locality:
          customerData.address?.locality ||
          request.user?.customer?.address?.locality,
        postalCode:
          customerData.address?.postalCode ||
          request.user?.customer?.address?.postalCode,
        country:
          customerData.address?.country ||
          request.user?.customer?.address?.country,
      },
    };
    this.logger.log(`Updating customer with ID: ${toUpdateCustomer.id}`);
    return this.customersService.updateCustomer(toUpdateCustomer);
  }
}
