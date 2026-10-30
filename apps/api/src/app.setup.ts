import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Shared by the local server, the Vercel handler and the e2e tests so they all run the same setup.
export function configureApp(app: INestApplication): void {
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Quotes API')
    .setDescription(
      'A public REST API for famous quotes from historical figures. ' +
        'Read endpoints are open; writes require the `x-api-key` header. ' +
        'Rate limit: 60 requests per minute per IP.',
    )
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}
