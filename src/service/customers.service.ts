import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { SquareService } from "./square.service";
import { serializeWithBigInt } from "src/util/utils";
import { SquareMapper } from "./mappers/square.mapper";
import { Customer } from "src/model/customer";

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper,
  ) {}

  async findOrCreateByPhone(phoneNumber: string): Promise<Customer> {
    this.logger.log(
      `Finding or creating customer with phone number: ${phoneNumber}`,
    );

    const existingCustomer =
      await this.squareService.findCustomerByPhone(phoneNumber);

    if (existingCustomer) {
      this.logger.debug(
        `Found existing customer: ${serializeWithBigInt(existingCustomer)}`,
      );
      return this.squareMapper.mapCustomer(existingCustomer);
    }

    this.logger.log(`No existing customer found, creating new customer`);
    const newCustomer = await this.squareService.createCustomer(phoneNumber);
    return this.squareMapper.mapCustomer(newCustomer);
  }

  async getCustomer(customerId: string): Promise<Customer> {
    this.logger.log(`Fetching customer with ID: ${customerId}`);

    const squareCustomer = await this.squareService.getCustomerById(customerId);

    if (!squareCustomer) {
      throw new NotFoundException(`Customer not found with ID: ${customerId}`);
    }

    return this.squareMapper.mapCustomer(squareCustomer);
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    this.logger.log(`Updating customer with ID: ${customer.id}`);

    if (!customer.id) {
      throw new Error("Customer ID is required for update");
    }

    const updatedSquareCustomer =
      await this.squareService.updateCustomer(customer);
    return this.squareMapper.mapCustomer(updatedSquareCustomer);
  }
}
