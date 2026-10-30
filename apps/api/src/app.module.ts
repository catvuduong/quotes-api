import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DbModule } from './db.module.js';
import { QuotesModule } from './quotes/quotes.module.js';

@Module({
  imports: [
    DbModule,
    // 60 requests per minute per IP. Responses carry X-RateLimit-* headers; 429s add Retry-After.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    },
  ],
})
export class AppModule {}
