import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

const LIMIT = 60;
const WINDOW_MS = 60_000;
const MAX_TRACKED_IPS = 10_000;

interface Window {
  count: number;
  resetAt: number;
}

/**
 * Fixed-window rate limit, 60 requests per minute per client IP, kept in memory.
 * Written in-house because @nestjs/throttler is CommonJS and require()s the ESM-only
 * @nestjs/common 12, which crashes the Vercel serverless runtime (ERR_REQUIRE_ESM).
 * Serverless instances do not share memory, so this limits bursts per instance.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, Window>();

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<{ ip?: string }>();
    const res = http.getResponse<{ setHeader(name: string, value: string | number): void }>();
    const now = Date.now();
    const key = req.ip ?? 'unknown';

    let w = this.windows.get(key);
    if (!w || w.resetAt <= now) {
      if (this.windows.size >= MAX_TRACKED_IPS) this.sweep(now);
      w = { count: 0, resetAt: now + WINDOW_MS };
      this.windows.set(key, w);
    }
    w.count += 1;

    const resetSeconds = Math.max(1, Math.ceil((w.resetAt - now) / 1000));
    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - w.count));
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (w.count > LIMIT) {
      res.setHeader('Retry-After', resetSeconds);
      throw new HttpException('Too many requests, please slow down', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private sweep(now: number): void {
    for (const [key, w] of this.windows) if (w.resetAt <= now) this.windows.delete(key);
    if (this.windows.size >= MAX_TRACKED_IPS) this.windows.clear();
  }
}
