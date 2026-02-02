import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*', // adjust in production
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Idle Garden API')
    .setDescription('Backend API for Idle Garden mobile game')
    .setVersion('1.0')
    .addTag('Authentication', 'Google OAuth & JWT endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Seeds', 'Seed information endpoints')
    .addTag('Locations', 'Location information endpoints')
    .addTag('Game', 'Game mechanics endpoints (plant, click, sell)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║        🌳 Idle Garden API is running! 🌳           ║
║                                                    ║
║  Server:      http://localhost:${port}                ║
║  API:         http://localhost:${port}/api            ║
║  Swagger:     http://localhost:${port}/api/docs       ║
║  Health:      http://localhost:${port}/api/health     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
}

bootstrap();
