import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.logger.error(
      `[${request.method} ${request.url}] Status: ${status}, Message: ${JSON.stringify(exceptionResponse)}`,
    );

    let errorMessage = 'Erro na requisição';
    if (status === 400 && typeof exceptionResponse === 'object') {
      const response = exceptionResponse as any;
      if (response.message && Array.isArray(response.message)) {
        errorMessage = response.message.join(', ');
      } else if (response.message) {
        errorMessage = response.message;
      }
    } else if (typeof exceptionResponse === 'object') {
      const response = exceptionResponse as any;
      errorMessage = response.message || JSON.stringify(exceptionResponse);
    }

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
