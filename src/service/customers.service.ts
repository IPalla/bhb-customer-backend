import { Injectable, Logger } from '@nestjs/common';
import { SquareService } from './square.service';
import { serializeWithBigInt } from 'src/util/utils';
import { SquareMapper } from './mappers/square.mapper';
import { Customer } from 'src/model/customer';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly squareService: SquareService,
    private readonly squareMapper: SquareMapper
  ) {}

  async findOrCreateByPhone(phoneNumber: string): Promise<Customer> {
    this.logger.log(`Finding or creating customer with phone number: ${phoneNumber}`);
    var squareCustomer = await this.squareService.findCustomerByPhone(phoneNumber);
    this.logger.log(`Found customer: ${serializeWithBigInt(squareCustomer)}`);
    if (!squareCustomer) {
        const newCustomer = await this.squareService.createCustomer(phoneNumber);
        squareCustomer = this.squareMapper.mapCustomer(newCustomer);
    }
    var internalCustomer = squareCustomer ? this.squareMapper.mapCustomer(squareCustomer) : undefined;
    return internalCustomer;
  }
}