import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DbService } from './db.service.js';

describe('AppController', () => {
  let appController: AppController;
  const db = { enabled: false, query: vi.fn() };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: DbService, useValue: db }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('describes the API and its endpoints', () => {
    const description = appController.describe();

    expect(description.name).toBe('Quotes API');
    expect(description.endpoints).toEqual(
      expect.arrayContaining([expect.stringContaining('DELETE /quotes/:id')]),
    );
  });

  it('health reports db disabled without DATABASE_URL', async () => {
    expect(await appController.health()).toEqual({ status: 'ok', db: 'disabled' });
  });

  it('rejects an empty item title', () => {
    expect(() => appController.addItem({ title: '  ' })).toThrow(BadRequestException);
  });
});
