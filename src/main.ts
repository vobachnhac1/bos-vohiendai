import './polyfills'; // Import polyfills first
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  // Force Node.js to use UTC timezone
  process.env.TZ = 'UTC';

  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable CORS
  app.enableCors({
    // origin: configService.get<string>('app.socketIoCorsOrigin'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Get port before Swagger setup
  const port = configService.get<number>('app.port') || 7878;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Swagger documentation - Only enable in non-production environments
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('GPS Backend API')
      .setDescription('GPS tracking backend API with real-time WebSocket support')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
          name: 'Basic Auth',
          description: 'Enter username and password for OpenAPI endpoints',
        },
        'basic',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        requestInterceptor: (req: any) => {
          // Log requests for debugging
          console.log('Swagger Request:', req.url);
          return req;
        },
      },
    });

    logger.log(`� Swagger documentation enabled at: http://localhost:${port}/api/docs`);
  } else {
    logger.warn('⚠️  Swagger documentation is disabled in production mode');
  }

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
// bootstrap().catch((error) => {
//   console.error('Error starting application:', error);
//   process.exit(1);
// });
