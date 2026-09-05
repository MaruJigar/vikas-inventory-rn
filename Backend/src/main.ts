import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(requestIdMiddleware);
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get('app');

  app.useGlobalFilters(
    new GlobalExceptionFilter(configService),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Mobile apps / Postman / Swagger
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',

        appConfig.adminPanelUrl,
        appConfig.reactNativeWebUrl,
        appConfig.frontendUrl,
      ].filter(Boolean);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.avchousehold.com')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vikas Inventory RN Platform API')
    .setDescription('Enterprise Backend API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      deepLinking: true,
    },
  });

  // Export OpenAPI (safe everywhere)
  try {
    const docsDir = path.resolve(process.cwd(), 'docs');

    fs.mkdirSync(docsDir, {
      recursive: true,
    });

    fs.writeFileSync(
      path.join(docsDir, 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
  } catch (err) {
    console.warn(
      'Unable to write OpenAPI specification:',
      err.message,
    );
  }

  await app.listen(appConfig.port, '0.0.0.0');

  console.log(
    `Server running on port ${appConfig.port}`,
  );
}

bootstrap();