import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AccountsModule } from "../accounts/accounts.module";
import { EmailService } from "src/services/email.service";
@Module({
  imports: [
    AccountsModule,
    ClientsModule.register([
      {
        name: 'EVENT_BUS',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'auth_events',       // queue publish/subscribe
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService]
})

export class AuthModule { }
