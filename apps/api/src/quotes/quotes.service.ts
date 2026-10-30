import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DbService } from '../db.service.js';
import { CreateQuoteDto } from './dto/create-quote.dto.js';
import { ListQuotesQuery, QuoteSortField, RandomQuoteQuery } from './dto/list-quotes.query.js';
import { AuthorCountDto, CategoryCountDto, PaginatedQuotesDto, QuoteDto } from './dto/quote.dto.js';
import { QUOTE_SEED } from './quotes.seed.js';

// Maps the public sort names to columns. Only these reach the SQL text, never raw user input.
const SORT_COLUMNS: Record<QuoteSortField, string> = {
  id: 'id',
  created_at: 'created_at',
  author: 'author',
  category: 'category',
};

const COLUMNS = 'id, text, author, category, language, created_at';

@Injectable()
export class QuotesService implements OnModuleInit {
  private readonly logger = new Logger(QuotesService.name);

  constructor(private readonly db: DbService) {}

  // Runs on every startup. The unique (text, author) index plus ON CONFLICT makes it a no-op once seeded.
  // A failure here is logged rather than thrown, so the API still boots when the database is briefly unavailable.
  async onModuleInit(): Promise<void> {
    if (!this.db.enabled) return;
    try {
      await this.db.query(
        `INSERT INTO quotes (text, author, category, language)
         SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[])
         ON CONFLICT (text, author) DO NOTHING`,
        [
          QUOTE_SEED.map((q) => q.text),
          QUOTE_SEED.map((q) => q.author),
          QUOTE_SEED.map((q) => q.category),
          QUOTE_SEED.map((q) => q.language),
        ],
      );
    } catch (err) {
      this.logger.error('Could not seed quotes', err instanceof Error ? err.stack : String(err));
    }
  }

  async list(query: ListQuotesQuery): Promise<PaginatedQuotesDto> {
    const { where, params } = this.filters(query);
    const sortColumn = SORT_COLUMNS[query.sort];
    const direction = query.order === 'desc' ? 'DESC' : 'ASC';
    const offset = (query.page - 1) * query.limit;

    const [data, [count]] = await Promise.all([
      this.run<QuoteDto>(
        `SELECT ${COLUMNS} FROM quotes ${where}
         ORDER BY ${sortColumn} ${direction}, id ${direction}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, query.limit, offset],
      ),
      this.run<{ total: number }>(`SELECT count(*)::int AS total FROM quotes ${where}`, params),
    ]);

    const total = count.total;
    return {
      data,
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async random(query: RandomQuoteQuery): Promise<QuoteDto> {
    const { where, params } = this.filters(query);
    const [quote] = await this.run<QuoteDto>(
      `SELECT ${COLUMNS} FROM quotes ${where} ORDER BY random() LIMIT 1`,
      params,
    );
    if (!quote) throw new NotFoundException('No quote matches the given filters');
    return quote;
  }

  async findOne(id: number): Promise<QuoteDto> {
    const [quote] = await this.run<QuoteDto>(`SELECT ${COLUMNS} FROM quotes WHERE id = $1`, [id]);
    if (!quote) throw new NotFoundException(`Quote ${id} not found`);
    return quote;
  }

  async create(dto: CreateQuoteDto): Promise<QuoteDto> {
    const [quote] = await this.run<QuoteDto>(
      `INSERT INTO quotes (text, author, category, language) VALUES ($1, $2, $3, $4)
       ON CONFLICT (text, author) DO NOTHING
       RETURNING ${COLUMNS}`,
      [dto.text, dto.author, dto.category, dto.language],
    );
    if (!quote) throw new ConflictException('This quote already exists for that author');
    return quote;
  }

  async remove(id: number): Promise<void> {
    const [deleted] = await this.run<{ id: number }>('DELETE FROM quotes WHERE id = $1 RETURNING id', [id]);
    if (!deleted) throw new NotFoundException(`Quote ${id} not found`);
  }

  authors(): Promise<AuthorCountDto[]> {
    return this.run<AuthorCountDto>(
      'SELECT author, count(*)::int AS count FROM quotes GROUP BY author ORDER BY author',
    );
  }

  categories(): Promise<CategoryCountDto[]> {
    return this.run<CategoryCountDto>(
      'SELECT category, count(*)::int AS count FROM quotes GROUP BY category ORDER BY category',
    );
  }

  // Author and category match exactly but ignore case; q is a substring match on the text.
  // LIKE wildcards in user input are escaped so that "%" and "_" are matched literally.
  private filters(filter: { author?: string; category?: string; q?: string }) {
    const clauses: string[] = [];
    const params: unknown[] = [];
    if (filter.author) {
      params.push(filter.author);
      clauses.push(`lower(author) = lower($${params.length})`);
    }
    if (filter.category) {
      params.push(filter.category);
      clauses.push(`lower(category) = lower($${params.length})`);
    }
    if (filter.q) {
      params.push(`%${filter.q.replace(/[\\%_]/g, '\\$&')}%`);
      clauses.push(`text ILIKE $${params.length}`);
    }
    return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
  }

  private async run<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (!this.db.enabled) throw new ServiceUnavailableException('Database is not configured');
    return this.db.query<T>(sql, params);
  }
}
