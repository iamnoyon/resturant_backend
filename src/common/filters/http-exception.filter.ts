import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'object' && exResponse !== null
          ? (exResponse as any).message || exception.message
          : exception.message;

      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `${request.method} ${request.url} - ${exception.message}`,
        exception.stack,
      );
      message =
        process.env.NODE_ENV === 'development'
          ? exception.message
          : 'Internal server error';
    } else {
      this.logger.error(
        `${request.method} ${request.url} - Unknown exception: ${JSON.stringify(exception)}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
    });
  }
}
