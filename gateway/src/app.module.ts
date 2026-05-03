import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AppController, AuthController],
  providers: [AppService, AuthController],
})
export class AppModule { }
