import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { CreateNotificationDto } from "../dto/notifications_module.dto";
import { NotificationService } from "../notifications.service";
import { channel } from "diagnostics_channel";

@Controller()
export class NotificationConsumer {
    constructor(private readonly notificationService: NotificationService) { }
    @EventPattern('send_notification')
    async handleSendNotification(
        @Payload() data: CreateNotificationDto,
        @Ctx() ctx: RmqContext,
    ) {
        try {
            console.log('Received notification:', data);
            // Idempotency: tránh tạo trùng
            await this.notificationService.createNotification(data);

            // ack message
            const channel = ctx.getChannelRef();
            const msg = ctx.getMessage();
            channel.ack(msg);
        } catch (e) {
            const channel = ctx.getChannelRef();
            const msg = ctx.getMessage();
            channel.ack(msg);
            // retry hoặc dead-letter (tuỳ config)
            // const channel = ctx.getChannelRef();
            // const msg = ctx.getMessage();
            // channel.nack(msg, false, true); // requeue
        }
    }
}