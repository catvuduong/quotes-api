import { ArgumentsHost, BadRequestException, HttpException, Logger, NotFoundException } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter.js';

function hostCapturing() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  const host = { switchToHttp: () => ({ getResponse: () => res }) } as unknown as ArgumentsHost;
  return { host, res };
}

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();

  it('formats a plain HTTP exception as { statusCode, error, message }', () => {
    const { host, res } = hostCapturing();

    filter.catch(new NotFoundException('Quote 3 not found'), host);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Not Found',
      message: 'Quote 3 not found',
    });
  });

  it('turns validation messages into a details list', () => {
    const { host, res } = hostCapturing();

    filter.catch(
      new BadRequestException(['limit must not be greater than 100', 'page must be an integer']),
      host,
    );

    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      details: ['limit must not be greater than 100', 'page must be an integer'],
    });
  });

  it('keeps the status of throttling errors', () => {
    const { host, res } = hostCapturing();

    filter.catch(new HttpException('Too many requests', 429), host);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 429, error: 'Too Many Requests' }),
    );
  });

  it('passes through client errors raised outside Nest, such as malformed JSON', () => {
    const { host, res } = hostCapturing();
    const parseError = Object.assign(new SyntaxError('Unexpected token'), { status: 400 });

    filter.catch(parseError, host);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'Unexpected token' }),
    );
  });

  it('hides internal errors behind a generic 500', () => {
    const { host, res } = hostCapturing();
    const logged = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('password authentication failed for user "app"'), host);

    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
    });
  });
});
