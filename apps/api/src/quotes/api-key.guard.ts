import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

// Guards write endpoints. The expected key comes from QUOTES_API_KEY at request time;
// when that variable is unset, every write is refused.
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.QUOTES_API_KEY;
    const provided = context.switchToHttp().getRequest<Request>().get('x-api-key');
    if (!expected || !provided || !sameSecret(provided, expected)) {
      throw new UnauthorizedException('Missing or invalid x-api-key header');
    }
    return true;
  }
}

// Hash both sides first so the comparison takes the same time whatever the lengths are.
function sameSecret(a: string, b: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
