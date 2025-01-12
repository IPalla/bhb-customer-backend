import { OperationEntity } from 'src/repository/model/operation.entity';
import { Operation } from 'src/model/operation';
export declare class OperationsService {
    private readonly operationmodel;
    private readonly logger;
    constructor(operationmodel: typeof OperationEntity);
    updateOperation(operationId: string, operation: Operation): Promise<void>;
}
