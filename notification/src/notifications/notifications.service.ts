import { Notification } from "./notifications.entity";
import { Repository } from "typeorm";
import { CreateNotificationDto } from "./dto/notifications_module.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly repo: Repository<Notification>,
    ) { }
    async createNotification(data: CreateNotificationDto) {
        console.log(data);
        const notification = new Notification();
        notification.userId = data.userId;
        notification.actorId = data.actorId;
        notification.type = data.type;
        notification.message = data.message;
        try {
            return await this.repo.save(notification);
        }
        catch (e) {
            console.log(e);
        }
    }
}