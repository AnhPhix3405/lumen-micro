import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { redisClient } from './configs/redisClient.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Redis connection failed", error);
  }
}
bootstrap();
