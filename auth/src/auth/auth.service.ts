import { Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { AccountsService } from "src/accounts/accounts.service";
import { EmailService } from "src/services/email.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        @Inject('EVENT_BUS')
        private client: ClientProxy,
        private readonly accountsService: AccountsService,
        private readonly emailService: EmailService,
    ) { }
    async createAccount(email: string, password: string) {
        const hashedPassword = await this.hashPassword(password);
        const account = await this.accountsService.createAccount({
            email: email,
            password_hash: hashedPassword,
        });
        await this.emailService.sendVerificationCode(email);
        // await this.client.emit('account_created', {
        //     version: 1,
        //     accountId: account.id,
        //     email: account.email,
        // });
        return account;
    }

    async hashPassword(password: string) {
        const saltRounds = Number(this.configService.get<string>('SALT_ROUNDS'));
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }

}