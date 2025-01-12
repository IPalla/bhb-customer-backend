import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../model/order';
import { OrderEntity } from '../repository/model/order.entity';
import { RiderEntity } from '../repository/model/rider.entity';
import { ItemEntity } from '../repository/model/item.entity';
import { Op } from 'sequelize';
import { Status } from '../model/status';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StatusEntity } from 'src/repository/model/status.entity';
import {
  getEventsFromTransition,
  isValidTransition,
  validTransitions,
} from './status.machine';
import { EventType } from 'src/model/events';
import { OperationEntity } from 'src/repository/model/operation.entity';
import { Operation } from 'src/model/operation';

@Injectable()
export class OperationsService {
  private readonly logger = new Logger(OperationsService.name);
  constructor(
    @InjectModel(OperationEntity)
    private readonly operationmodel: typeof OperationEntity,
  ) {}

  // This function updates the operation with the given id without overriding any non null existing property
  async updateOperation(
    operationId: string,
    operation: Operation,
  ): Promise<void> {
    this.logger.log(`Updating operation: ${operationId}`);

    const existingOperation = await this.operationmodel.findByPk(operationId);
    if (!existingOperation) {
      this.logger.error('Operation not found');
    }
    const updatedOperation = { ...existingOperation, ...operation };
    await existingOperation.update(updatedOperation);
  }
}
