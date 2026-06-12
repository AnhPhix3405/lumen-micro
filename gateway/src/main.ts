import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './exeptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  app.useGlobalFilters(new AllExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Lumen Micro API')
    .setDescription('API Gateway for Lumen Micro services')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(8888, '127.0.0.1');
}
bootstrap();
