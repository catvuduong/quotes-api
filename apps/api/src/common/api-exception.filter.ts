import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';

// Every error leaves the API in one shape: { statusCode, error, message, details? }.
// `details` is only present for validation failures and lists each offending field.
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const { status, message, details } = this.describe(exception);
    res.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status] ?? 'Error',
      message,
      ...(details ? { details } : {}),
    });
  }

  private describe(exception: unknown): { status: number; message: string; details?: string[] } {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const raw = typeof body === 'string' ? body : (body as { message?: unknown }).message;
      if (Array.isArray(raw)) {
        return { status: exception.getStatus(), message: 'Validation failed', details: raw.map(String) };
      }
      return { status: exception.getStatus(), message: typeof raw === 'string' ? raw : exception.message };
    }

    // Errors thrown by Express/body-parser (e.g. malformed JSON) carry their own 4xx status.
    const status = (exception as { status?: unknown })?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return { status, message: (exception as Error).message };
    }

    this.logger.error('Unhandled error', exception instanceof Error ? exception.stack : String(exception));
    return { status: 500, message: 'Internal server error' };
  }
}
