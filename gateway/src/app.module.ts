import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { ExamController } from './exam.controller';
import { AdminExamController } from './admin-exam.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  })],
  controllers: [AuthController, UserController, ExamController, AdminExamController],
  providers: [AuthController, UserController, ExamController, AdminExamController],
})
export class AppModule { }
