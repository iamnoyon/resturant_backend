import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'https://cloud-cafe-a259r5plo-noyon-sarkers-projects.vercel.app/',
    ],
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  app.use('/api/uploads', express.static(join(__dirname, '..', 'uploads')));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Restaurant Management API')
    .setDescription('API documentation for the Restaurant Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('APP_PORT', 3001);
  await app.listen(port);
  console.log(`[Server] Running on http://localhost:${port}`);
  console.log(`[Swagger] http://localhost:${port}/api-docs`);
}
bootstrap();
