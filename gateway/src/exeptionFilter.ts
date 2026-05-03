import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Lỗi hệ thống nội bộ';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    // Trường hợp exception là HttpException (phát sinh từ Gateway hoặc từ service con)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = exceptionResponse['message'] || exceptionResponse;
        errorCode = exceptionResponse['error'] || exceptionResponse['code'] || 'HTTP_EXCEPTION';
      } else {
        message = exceptionResponse;
      }
    }
    // TRƯỜNG HỢP MỚI: Bắt lỗi của Axios khi gọi sang service con
    else if (exception && typeof exception === 'object' && 'isAxiosError' in exception) {
      const axiosError = exception as any;

      if (axiosError.response) {
        // Lấy HTTP Status code mà service con (auth-service) đã trả về
        status = axiosError.response.status;

        // Lấy nội dung body (thường chứa message lỗi) mà auth-service trả về
        const errorData = axiosError.response.data;

        if (typeof errorData === 'object' && errorData !== null) {
          message = errorData.message || errorData;
          errorCode = errorData.error || errorData.code || 'SERVICE_ERROR';
        } else {
          message = errorData;
        }
      } else {
        // Trường hợp lỗi mạng (timeout, không kết nối được service)
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Không thể kết nối tới dịch vụ xác thực';
        errorCode = 'SERVICE_UNAVAILABLE';
      }
    }
    // Lỗi hệ thống hoặc lỗi JavaScript khác
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Trả về response đồng nhất cho Client
    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}