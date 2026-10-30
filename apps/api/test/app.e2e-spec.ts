import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) describes the API and its endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);

    expect(res.body.name).toBe('Quotes API');
    expect(res.body.docs).toBe('/docs');
    expect(res.body.endpoints).toEqual(expect.arrayContaining([expect.stringContaining('GET /quotes')]));
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  afterEach(async () => {
    await app.close();
  });
});
