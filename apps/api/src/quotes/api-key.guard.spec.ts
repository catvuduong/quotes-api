import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard.js';

function contextWithHeader(value: string | undefined): ExecutionContext {
  const request = { get: (name: string) => (name === 'x-api-key' ? value : undefined) };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('ApiKeyGuard', () => {
  const guard = new ApiKeyGuard();
  const saved = process.env.QUOTES_API_KEY;

  beforeEach(() => {
    process.env.QUOTES_API_KEY = 'secret-123';
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.QUOTES_API_KEY;
    else process.env.QUOTES_API_KEY = saved;
  });

  it('allows the request when the key matches', () => {
    expect(guard.canActivate(contextWithHeader('secret-123'))).toBe(true);
  });

  it('refuses a missing header', () => {
    expect(() => guard.canActivate(contextWithHeader(undefined))).toThrow(UnauthorizedException);
  });

  it('refuses a wrong key, including a key that is only a prefix', () => {
    expect(() => guard.canActivate(contextWithHeader('secret'))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(contextWithHeader('secret-1234'))).toThrow(UnauthorizedException);
  });

  it('refuses everything when QUOTES_API_KEY is unset or empty', () => {
    delete process.env.QUOTES_API_KEY;
    expect(() => guard.canActivate(contextWithHeader(''))).toThrow(UnauthorizedException);

    process.env.QUOTES_API_KEY = '';
    expect(() => guard.canActivate(contextWithHeader(''))).toThrow(UnauthorizedException);
  });
});
