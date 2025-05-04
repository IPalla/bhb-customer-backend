import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { Response } from "express";
import { SquareServiceError } from "./square-service.error";

@Catch(SquareServiceError)
export class SquareServiceErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(SquareServiceErrorFilter.name);

  catch(exception: SquareServiceError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Get error details from the SquareServiceError
    const errorInfo = exception.getErrorInfo();

    this.logger.error(
      `Square payment error on ${request.url}: ${JSON.stringify(errorInfo)}`,
    );
    this.logger.debug(
      `Raw error details: ${JSON.stringify(exception.details, null, 2)}`,
    );

    // Return a structured error response
    response.status(400).json({
      success: false,
      error: "Payment Failed",
      code: errorInfo.code,
      detail: errorInfo.detail,
      category: errorInfo.category,
    });
  }
}
