import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { loadConfig } from './configs/cloudinary.config';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  loadConfig(configService);
  // app.connectMicroservice({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://guest:guest@localhost:5672'],
  //     queue: 'auth_events',           // cùng queue (pub/sub)
  //     queueOptions: { durable: true },
  //     noAck: false,                   // để ack thủ công nếu cần
  //   },
  // });

  // await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
