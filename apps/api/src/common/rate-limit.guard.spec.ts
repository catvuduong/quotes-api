import { ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard.js';

function contextFor(ip: string) {
  const headers: Record<string, string | number> = {};
  const res = { setHeader: (name: string, value: string | number) => { headers[name] = value; } };
  const context = {
    switchToHttp: () => ({ getRequest: () => ({ ip }), getResponse: () => res }),
  } as unknown as ExecutionContext;
  return { context, headers };
}

describe('RateLimitGuard', () => {
  afterEach(() => vi.useRealTimers());

  it('counts requests per IP and reports the remaining allowance', () => {
    const guard = new RateLimitGuard();
    const first = contextFor('1.1.1.1');
    const second = contextFor('1.1.1.1');

    expect(guard.canActivate(first.context)).toBe(true);
    expect(guard.canActivate(second.context)).toBe(true);

    expect(first.headers['X-RateLimit-Limit']).toBe(60);
    expect(first.headers['X-RateLimit-Remaining']).toBe(59);
    expect(second.headers['X-RateLimit-Remaining']).toBe(58);
    expect(Number(first.headers['X-RateLimit-Reset'])).toBeGreaterThan(0);
  });

  it('rejects the 61st request with 429 and Retry-After, without affecting other IPs', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 60; i++) guard.canActivate(contextFor('2.2.2.2').context);

    const blocked = contextFor('2.2.2.2');
    expect(() => guard.canActivate(blocked.context)).toThrow(HttpException);
    expect(blocked.headers['Retry-After']).toBeDefined();
    expect(blocked.headers['X-RateLimit-Remaining']).toBe(0);

    expect(guard.canActivate(contextFor('3.3.3.3').context)).toBe(true);
  });

  it('starts a fresh window once the minute is over', () => {
    vi.useFakeTimers();
    const guard = new RateLimitGuard();
    for (let i = 0; i < 61; i++) {
      try { guard.canActivate(contextFor('4.4.4.4').context); } catch { /* over the limit */ }
    }

    vi.advanceTimersByTime(61_000);

    const again = contextFor('4.4.4.4');
    expect(guard.canActivate(again.context)).toBe(true);
    expect(again.headers['X-RateLimit-Remaining']).toBe(59);
  });
});
