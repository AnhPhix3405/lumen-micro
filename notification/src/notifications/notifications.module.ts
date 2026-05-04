import { Module } from "@nestjs/common";
import { NotificationConsumer } from "./consumer/notifications.consumer";
import { NotificationService } from "./notifications.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notifications.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    controllers: [NotificationConsumer],
    providers: [NotificationService],
    imports: [TypeOrmModule.forFeature([Notification]),
    ClientsModule.register([
        {
            name: 'NOTIFICATION_BUS',
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://guest:guest@localhost:5672'],
                queue: 'notification_event',
                queueOptions: { durable: false },
            },
        }
    ])
    ]
})

export class NotificationsModule { }
