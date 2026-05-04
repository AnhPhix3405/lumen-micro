import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { UserConsumer } from "./consumers/user.consumer";
import { UsersService } from "./users.service";
import { CloudinaryService } from "src/upload/cloudinary.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UserFollows } from "src/entites/user_follows.entity";

@Module({
    controllers: [UsersController, UserConsumer],
    imports: [TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserFollows]),
    ClientsModule.register([
        {
            name: 'EVENT_BUS',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://guest:guest@localhost:5672'],
                queue: 'notification_events',
                queueOptions: { durable: true },
            },
        },

    ])
    ],
    providers: [UsersService, CloudinaryService]
})

export class UsersModule { }