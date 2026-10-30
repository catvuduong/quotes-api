import { Global, Module } from '@nestjs/common';
import { DbService } from './db.service.js';

// One global module so every feature shares a single connection pool.
@Global()
@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
