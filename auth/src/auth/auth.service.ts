import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthAccount } from "../accounts/accounts.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthAccount)
        private readonly accountsRepository: Repository<AuthAccount>,
        private readonly configService: ConfigService,
    ) { }
    async createAccount(email: string, password: string) {
        const hashedPassword = await this.hashPassword(password);
        const account = this.accountsRepository.create({
            email: email,
            password_hash: hashedPassword,
            provider: "local",
            is_verified: false,
            status: "pending",
        });
        await this.accountsRepository.save(account);
        return account;
    }

    async hashPassword(password: string) {
        const saltRounds = this.configService.get<number>("SALT_ROUNDS");
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }

}