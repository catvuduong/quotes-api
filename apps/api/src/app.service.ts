import { Injectable } from '@nestjs/common';
import { DbService } from './db.service.js';

export interface Item {
  id: number;
  title: string;
}

@Injectable()
export class AppService {
  constructor(private readonly db: DbService) {}

  describe() {
    return {
      name: 'Quotes API',
      description:
        'A public REST API for famous quotes from historical figures. Read endpoints are open; writes need an x-api-key header.',
      docs: '/docs',
      rateLimit: '60 requests per minute per IP (X-RateLimit-* headers are returned).',
      endpoints: [
        'GET /quotes - list quotes. Query: page, limit (max 100), author, category, q (text search), sort (id, created_at, author, category), order (asc, desc).',
        'GET /quotes/random - one random quote. Query: category, author.',
        'GET /quotes/:id - one quote by id.',
        'GET /authors - every author with their quote count.',
        'GET /categories - every category with its quote count.',
        'POST /quotes - add a quote. Requires the x-api-key header.',
        'DELETE /quotes/:id - delete a quote. Requires the x-api-key header.',
        'GET /health - service and database status.',
      ],
    };
  }

  async health(): Promise<{ status: 'ok'; db: 'up' | 'down' | 'disabled' }> {
    if (!this.db.enabled) return { status: 'ok', db: 'disabled' };
    try {
      await this.db.query('SELECT 1');
      return { status: 'ok', db: 'up' };
    } catch {
      return { status: 'ok', db: 'down' };
    }
  }

  listItems(): Promise<Item[]> {
    return this.db.query<Item>('SELECT id, title FROM items ORDER BY id DESC LIMIT 50');
  }

  async addItem(title: string): Promise<Item> {
    const rows = await this.db.query<Item>('INSERT INTO items (title) VALUES ($1) RETURNING id, title', [
      title,
    ]);
    return rows[0];
  }
}
