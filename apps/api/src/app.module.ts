import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ApiExceptionFilter } from './common/api-exception.filter.js';
import { RateLimitGuard } from './common/rate-limit.guard.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DbModule } from './db.module.js';
import { QuotesModule } from './quotes/quotes.module.js';

@Module({
  imports: [
    DbModule,
    QuotesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    },
  ],
})
export class AppModule {}
