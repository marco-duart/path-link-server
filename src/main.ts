import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Path Link API')
    .setDescription('API documentation for Path Link application')
    .setVersion('1.0')
    .addServer('v1', 'Version 1')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('v1');
  app.enableCors({ origin: '*' });

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
