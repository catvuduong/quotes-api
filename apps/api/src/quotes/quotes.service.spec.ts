import {
  ConflictException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DbService } from '../db.service.js';
import { ListQuotesQuery } from './dto/list-quotes.query.js';
import { QuotesService } from './quotes.service.js';
import { QUOTE_SEED } from './quotes.seed.js';

function listQuery(overrides: Partial<ListQuotesQuery> = {}): ListQuotesQuery {
  return Object.assign(new ListQuotesQuery(), overrides);
}

describe('QuotesService', () => {
  const db = { enabled: true, query: vi.fn() };
  let service: QuotesService;

  beforeEach(() => {
    db.enabled = true;
    db.query.mockReset();
    service = new QuotesService(db as unknown as DbService);
  });

  describe('onModuleInit', () => {
    it('seeds the table with every quote in one idempotent insert', async () => {
      db.query.mockResolvedValue([]);

      await service.onModuleInit();

      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('ON CONFLICT (text, author) DO NOTHING');
      expect(params).toEqual([
        QUOTE_SEED.map((q) => q.text),
        QUOTE_SEED.map((q) => q.author),
        QUOTE_SEED.map((q) => q.category),
        QUOTE_SEED.map((q) => q.language),
      ]);
    });

    it('does nothing when the database is not configured', async () => {
      db.enabled = false;

      await service.onModuleInit();

      expect(db.query).not.toHaveBeenCalled();
    });

    it('logs and swallows seeding failures so the API still starts', async () => {
      const logged = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      db.query.mockRejectedValue(new Error('connection refused'));

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(logged).toHaveBeenCalledWith('Could not seed quotes', expect.stringContaining('connection refused'));
      logged.mockRestore();
    });
  });

  describe('list', () => {
    it('builds case-insensitive author and category filters with positional params', async () => {
      db.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);

      await service.list(listQuery({ author: 'Oscar Wilde', category: 'literature' }));

      const [dataSql, dataParams] = db.query.mock.calls[0];
      expect(dataSql).toContain('WHERE lower(author) = lower($1) AND lower(category) = lower($2)');
      expect(dataParams).toEqual(['Oscar Wilde', 'literature', 20, 0]);
    });

    it('escapes LIKE wildcards in the text search', async () => {
      db.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);

      await service.list(listQuery({ q: '50%_off\\' }));

      const [, params] = db.query.mock.calls[0];
      expect(params[0]).toBe('%50\\%\\_off\\\\%');
    });

    it('maps the sort name to its column and computes the offset', async () => {
      db.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);

      await service.list(listQuery({ page: 3, limit: 10, sort: 'created_at', order: 'desc' }));

      const [dataSql, dataParams] = db.query.mock.calls[0];
      expect(dataSql).toContain('ORDER BY created_at DESC, id DESC');
      expect(dataParams).toEqual([10, 20]);
    });

    it('returns pagination metadata with the total page count', async () => {
      db.query.mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ total: 41 }]);

      const page = await service.list(listQuery({ page: 2, limit: 20 }));

      expect(page).toEqual({
        data: [{ id: 1 }],
        meta: { page: 2, limit: 20, total: 41, totalPages: 3 },
      });
    });
  });

  describe('random', () => {
    it('throws 404 when no quote matches', async () => {
      db.query.mockResolvedValue([]);

      await expect(service.random({ category: 'nope' })).rejects.toThrow(NotFoundException);
    });

    it('filters the random pick by category', async () => {
      db.query.mockResolvedValue([{ id: 7 }]);

      await service.random({ category: 'science' });

      expect(db.query.mock.calls[0][0]).toContain('WHERE lower(category) = lower($1)');
      expect(db.query.mock.calls[0][1]).toEqual(['science']);
    });
  });

  describe('findOne', () => {
    it('throws 404 with the id in the message', async () => {
      db.query.mockResolvedValue([]);

      await expect(service.findOne(42)).rejects.toThrow('Quote 42 not found');
    });
  });

  describe('create', () => {
    const dto = { text: 'Knowledge is power.', author: 'Francis Bacon', category: 'science', language: 'en' };

    it('inserts the quote', async () => {
      db.query.mockResolvedValue([{ id: 65, ...dto }]);

      await expect(service.create(dto)).resolves.toMatchObject({ id: 65 });
      expect(db.query.mock.calls[0][1]).toEqual([dto.text, dto.author, dto.category, dto.language]);
    });

    it('throws 409 when the insert conflicts with an existing quote', async () => {
      db.query.mockResolvedValue([]);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('throws 404 when no row was deleted', async () => {
      db.query.mockResolvedValue([]);

      await expect(service.remove(9)).rejects.toThrow(NotFoundException);
    });
  });

  describe('without a database', () => {
    it('answers 503 instead of crashing', async () => {
      db.enabled = false;

      await expect(service.list(listQuery())).rejects.toThrow(ServiceUnavailableException);
      await expect(service.authors()).rejects.toThrow(ServiceUnavailableException);
      expect(db.query).not.toHaveBeenCalled();
    });
  });
});
