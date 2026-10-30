import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

let server: express.Express | undefined;

// Entry point for Vercel (see api/index.js and vercel.json). Local/CI use src/main.ts instead.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!server) {
    const exp = express();
    // Vercel sits in front of the function, so the client IP is the one it appends to X-Forwarded-For.
    // Trusting only that hop keeps the rate limiter from keying every request to Vercel's address.
    exp.set('trust proxy', 1);
    const app = await NestFactory.create(AppModule, new ExpressAdapter(exp));
    configureApp(app);
    await app.init();
    server = exp;
  }
  server(req, res);
}
