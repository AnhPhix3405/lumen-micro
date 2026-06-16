import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : res['message'];
    } else if (exception instanceof QueryFailedError) {
      status = 400;
      message = exception.message;
    } else if (exception instanceof Error) {
      console.error('Unhandled exception:', exception);
      message = exception.message;
    }
    else if (exception instanceof BadRequestException) {
      status = 400;
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : res['message'];
    }
    else if (exception instanceof UnauthorizedException) {
      status = 401;
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : res['message'];
    }
    else if (exception instanceof NotFoundException) {
      status = 404;
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : res['message'];
    }
    else if (exception instanceof InternalServerErrorException) {
      status = 500;
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : res['message'];
    }
    else if (exception instanceof TypeError) {
      status = 400;
      message = exception.message;

    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
