import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller.js';
import { QuotesController } from './quotes.controller.js';
import { QuotesService } from './quotes.service.js';

@Module({
  controllers: [QuotesController, CatalogController],
  providers: [QuotesService],
})
export class QuotesModule {}
