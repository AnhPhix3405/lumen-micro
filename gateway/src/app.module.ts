import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { ExamController } from './exam.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  })],
  controllers: [AuthController, UserController, ExamController],
  providers: [AuthController, UserController, ExamController],
})
export class AppModule { }
