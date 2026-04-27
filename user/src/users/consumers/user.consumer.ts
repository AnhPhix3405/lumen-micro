// user.consumer.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { UsersService } from '../users.service';

@Controller()
export class UserConsumer {
    constructor(private readonly userService: UsersService) { }
    @EventPattern('account_created')
    async handleAccountCreated(
        @Payload() data: any,
        @Ctx() ctx: RmqContext,
    ) {
        try {
            // Idempotency: tránh tạo trùng
            await this.userService.createAccount(data.email, data.accountId);

            // ack message
            const channel = ctx.getChannelRef();
            const msg = ctx.getMessage();
            channel.ack(msg);
        } catch (e) {
            // retry hoặc dead-letter (tuỳ config)
            const channel = ctx.getChannelRef();
            const msg = ctx.getMessage();
            channel.nack(msg, false, true); // requeue
        }
    }
}