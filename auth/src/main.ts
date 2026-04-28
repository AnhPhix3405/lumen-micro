import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { redisClient } from './configs/redisClient.config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './exeptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Redis connection failed", error);
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
