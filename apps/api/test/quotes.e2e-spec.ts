import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';

const API_KEY = 'e2e-test-key';

describe('Quotes API (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeAll(() => {
    process.env.QUOTES_API_KEY = API_KEY;
  });

  afterAll(() => {
    delete process.env.QUOTES_API_KEY;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /quotes', () => {
    it('paginates with page and limit', async () => {
      const first = await http().get('/quotes?page=1&limit=5').expect(200);
      const second = await http().get('/quotes?page=2&limit=5').expect(200);

      expect(first.body.data).toHaveLength(5);
      expect(second.body.data).toHaveLength(5);
      expect(first.body.meta).toEqual({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        totalPages: Math.ceil(first.body.meta.total / 5),
      });
      expect(first.body.meta.total).toBeGreaterThanOrEqual(60);

      const firstIds = first.body.data.map((q: { id: number }) => q.id);
      const secondIds = second.body.data.map((q: { id: number }) => q.id);
      expect(secondIds.some((id: number) => firstIds.includes(id))).toBe(false);
    });

    it('defaults to page 1 with 20 items', async () => {
      const res = await http().get('/quotes').expect(200);

      expect(res.body.meta).toMatchObject({ page: 1, limit: 20 });
      expect(res.body.data).toHaveLength(20);
    });

    it('returns an empty data array for a page past the end', async () => {
      const res = await http().get('/quotes?page=1000&limit=100').expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('returns quote fields in the documented shape', async () => {
      const res = await http().get('/quotes?limit=1').expect(200);

      expect(res.body.data[0]).toEqual({
        id: expect.any(Number),
        text: expect.any(String),
        author: expect.any(String),
        category: expect.any(String),
        language: expect.any(String),
        created_at: expect.any(String),
      });
    });

    it('filters by category, ignoring case', async () => {
      const res = await http().get('/quotes?category=PHILOSOPHY&limit=100').expect(200);
      const counts = await http().get('/categories').expect(200);
      const philosophy = counts.body.find((c: { category: string }) => c.category === 'philosophy');

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((q: { category: string }) => q.category === 'philosophy')).toBe(true);
      expect(res.body.meta.total).toBe(philosophy.count);
    });

    it('filters by author, ignoring case', async () => {
      const res = await http().get('/quotes?author=william shakespeare&limit=100').expect(200);
      const counts = await http().get('/authors').expect(200);
      const shakespeare = counts.body.find((a: { author: string }) => a.author === 'William Shakespeare');

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((q: { author: string }) => q.author === 'William Shakespeare')).toBe(true);
      expect(res.body.meta.total).toBe(shakespeare.count);
    });

    it('combines author and category filters', async () => {
      const res = await http().get('/quotes?author=Oscar Wilde&category=literature').expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      for (const quote of res.body.data) {
        expect(quote).toMatchObject({ author: 'Oscar Wilde', category: 'literature' });
      }
    });

    it('searches quote text case-insensitively', async () => {
      const res = await http().get('/quotes?q=STAGE&limit=100').expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.every((q: { text: string }) => q.text.toLowerCase().includes('stage'))).toBe(true);
    });

    it('matches LIKE wildcards in q literally', async () => {
      const percent = await http().get('/quotes?q=%25').expect(200);
      const underscore = await http().get('/quotes?q=_').expect(200);

      expect(percent.body.meta.total).toBe(0);
      expect(underscore.body.meta.total).toBe(0);
    });

    it('sorts by author in descending order', async () => {
      // Compare against the ascending order the database produces, so the check does not depend on collation.
      const authorsIn = async (order: 'asc' | 'desc') => {
        const res = await http().get(`/quotes?sort=author&order=${order}&limit=100`).expect(200);
        const names: string[] = res.body.data.map((q: { author: string }) => q.author);
        return names.filter((name, i) => i === 0 || names[i - 1] !== name);
      };

      const ascending = await authorsIn('asc');
      const descending = await authorsIn('desc');

      expect(ascending.length).toBeGreaterThan(1);
      expect(descending).toEqual([...ascending].reverse());
    });

    it('sorts by id descending when asked', async () => {
      const res = await http().get('/quotes?sort=id&order=desc&limit=10').expect(200);
      const ids = res.body.data.map((q: { id: number }) => q.id);

      expect(ids).toEqual([...ids].sort((a, b) => b - a));
    });

    it('rejects a limit above 100 with a consistent JSON error', async () => {
      const res = await http().get('/quotes?limit=101').expect(400);

      expect(res.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: expect.arrayContaining([expect.stringContaining('limit')]),
      });
    });

    it('rejects a page below 1 and a non-numeric limit', async () => {
      await http().get('/quotes?page=0').expect(400);
      await http().get('/quotes?limit=abc').expect(400);
    });

    it('rejects an unknown sort field', async () => {
      const res = await http().get('/quotes?sort=text').expect(400);

      expect(res.body.details).toEqual(expect.arrayContaining([expect.stringContaining('sort')]));
    });

    it('rejects unknown query parameters', async () => {
      await http().get('/quotes?colour=blue').expect(400);
    });
  });

  describe('GET /quotes/random', () => {
    it('returns one quote', async () => {
      const res = await http().get('/quotes/random').expect(200);

      expect(res.body).toMatchObject({ id: expect.any(Number), text: expect.any(String) });
    });

    it('respects the category filter', async () => {
      const res = await http().get('/quotes/random?category=science').expect(200);

      expect(res.body.category).toBe('science');
    });

    it('respects the author filter', async () => {
      const res = await http().get('/quotes/random?author=Isaac Newton').expect(200);

      expect(res.body.author).toBe('Isaac Newton');
    });

    it('returns 404 when no quote matches', async () => {
      const res = await http().get('/quotes/random?category=no-such-category').expect(404);

      expect(res.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'No quote matches the given filters',
      });
    });
  });

  describe('GET /quotes/:id', () => {
    it('returns the quote with that id', async () => {
      const list = await http().get('/quotes?limit=1').expect(200);
      const { id } = list.body.data[0];

      const res = await http().get(`/quotes/${id}`).expect(200);

      expect(res.body).toEqual(list.body.data[0]);
    });

    it('returns 404 with a JSON body for an unknown id', async () => {
      const res = await http().get('/quotes/2147483647').expect(404);

      expect(res.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Quote 2147483647 not found',
      });
    });

    it('returns 400 for ids that are not positive 32-bit integers', async () => {
      await http().get('/quotes/abc').expect(400);
      await http().get('/quotes/0').expect(400);
      await http().get('/quotes/1.5').expect(400);
      await http().get('/quotes/99999999999').expect(400);
    });
  });

  describe('GET /authors and GET /categories', () => {
    it('counts add up to the total number of quotes', async () => {
      const all = await http().get('/quotes?limit=1').expect(200);
      const authors = await http().get('/authors').expect(200);
      const categories = await http().get('/categories').expect(200);

      const sum = (rows: { count: number }[]) => rows.reduce((total, row) => total + row.count, 0);
      expect(sum(authors.body)).toBe(all.body.meta.total);
      expect(sum(categories.body)).toBe(all.body.meta.total);
    });

    it('lists authors and categories with their counts', async () => {
      const authors = await http().get('/authors').expect(200);
      const categories = await http().get('/categories').expect(200);

      expect(authors.body[0]).toEqual({ author: expect.any(String), count: expect.any(Number) });
      expect(categories.body[0]).toEqual({ category: expect.any(String), count: expect.any(Number) });
    });
  });

  describe('write endpoints', () => {
    const newQuote = {
      text: 'Test quote created by the e2e suite.',
      author: 'E2E Author',
      category: 'E2E-Category',
    };

    it('rejects POST /quotes without an API key', async () => {
      const res = await http().post('/quotes').send(newQuote).expect(401);

      expect(res.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing or invalid x-api-key header',
      });
    });

    it('rejects POST /quotes with a wrong API key', async () => {
      await http().post('/quotes').set('x-api-key', 'wrong').send(newQuote).expect(401);
    });

    it('rejects every write when QUOTES_API_KEY is not configured', async () => {
      const saved = process.env.QUOTES_API_KEY;
      delete process.env.QUOTES_API_KEY;
      try {
        await http().post('/quotes').set('x-api-key', API_KEY).send(newQuote).expect(401);
      } finally {
        process.env.QUOTES_API_KEY = saved;
      }
    });

    it('rejects DELETE /quotes/:id without an API key', async () => {
      const { body } = await http().get('/quotes?limit=1').expect(200);

      await http().delete(`/quotes/${body.data[0].id}`).expect(401);
      await http().get(`/quotes/${body.data[0].id}`).expect(200);
    });

    it('creates a quote with a valid API key, then deletes it', async () => {
      const created = await http().post('/quotes').set('x-api-key', API_KEY).send(newQuote).expect(201);

      expect(created.body).toMatchObject({
        id: expect.any(Number),
        text: newQuote.text,
        author: newQuote.author,
        category: 'e2e-category',
        language: 'en',
      });

      const fetched = await http().get(`/quotes/${created.body.id}`).expect(200);
      expect(fetched.body).toEqual(created.body);

      await http().delete(`/quotes/${created.body.id}`).set('x-api-key', API_KEY).expect(204);
      await http().get(`/quotes/${created.body.id}`).expect(404);
    });

    it('returns 409 when the same text and author already exist', async () => {
      const res = await http()
        .post('/quotes')
        .set('x-api-key', API_KEY)
        .send({ text: 'Knowledge is power.', author: 'Francis Bacon', category: 'science' })
        .expect(409);

      expect(res.body).toMatchObject({ statusCode: 409, error: 'Conflict' });
    });

    it('validates the body and lists every failing field', async () => {
      const res = await http()
        .post('/quotes')
        .set('x-api-key', API_KEY)
        .send({ text: '', author: 'x'.repeat(101), category: 'science', language: 'English' })
        .expect(400);

      expect(res.body.message).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('text'),
          expect.stringContaining('author'),
          expect.stringContaining('language'),
        ]),
      );
    });

    it('rejects unknown body fields', async () => {
      await http()
        .post('/quotes')
        .set('x-api-key', API_KEY)
        .send({ ...newQuote, rating: 5 })
        .expect(400);
    });

    it('returns 404 when deleting an unknown quote', async () => {
      const res = await http().delete('/quotes/2147483647').set('x-api-key', API_KEY).expect(404);

      expect(res.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Quote 2147483647 not found',
      });
    });
  });

  describe('rate limiting', () => {
    it('sends X-RateLimit headers on every response', async () => {
      const first = await http().get('/quotes/random').expect(200);
      const second = await http().get('/quotes/random').expect(200);

      expect(first.headers['x-ratelimit-limit']).toBe('60');
      expect(first.headers['x-ratelimit-remaining']).toBe('59');
      expect(second.headers['x-ratelimit-remaining']).toBe('58');
      expect(Number(first.headers['x-ratelimit-reset'])).toBeGreaterThan(0);
    });

    it('answers 429 with Retry-After once 60 requests are used up', async () => {
      for (let i = 0; i < 60; i++) {
        await http().get('/health').expect(200);
      }

      const res = await http().get('/health').expect(429);

      expect(res.headers['retry-after']).toBeDefined();
      expect(res.body).toMatchObject({ statusCode: 429, error: 'Too Many Requests' });
    });
  });

  describe('CORS and docs', () => {
    it('allows cross-origin reads', async () => {
      const res = await http().get('/quotes/random').set('Origin', 'https://example.com').expect(200);

      expect(res.headers['access-control-allow-origin']).toBe('*');
    });

    it('serves the OpenAPI document with the quote endpoints and the api-key scheme', async () => {
      const spec = await http().get('/docs-json').expect(200);

      expect(spec.body.openapi).toMatch(/^3\./);
      expect(Object.keys(spec.body.paths)).toEqual(
        expect.arrayContaining(['/quotes', '/quotes/random', '/quotes/{id}', '/authors', '/categories']),
      );
      expect(spec.body.components.securitySchemes['api-key']).toMatchObject({
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      });
    });

    it('serves the Swagger UI at /docs', async () => {
      const res = await http().get('/docs').expect(200);

      expect(res.text).toContain('swagger');
    });
  });
});
