import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { AccountsService } from "src/accounts/accounts.service";
import { EmailService } from "src/services/email.service";
import { redisClient } from "src/configs/redisClient.config";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
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

    async verifyAccount(email: string, code: string) {
        const storedCode = await redisClient.get(email);
        if (!storedCode) {
            throw new BadRequestException("Verification code expired");
        }
        if (storedCode !== code) {
            throw new BadRequestException("Invalid verification code");
        }
        await this.accountsService.verifyAccount(email);
        await redisClient.del(email);
    }

    async login(email: string, password: string) {
        const existAccount = await this.accountsService.getAccountByEmail(email);
        if(!existAccount) {
            throw new BadRequestException("Account not found");
        }
        const isPasswordValid = await bcrypt.compare(password, existAccount.password_hash);
        if(!isPasswordValid) {
            throw new BadRequestException("Invalid password");
        }
        const payload = {
            accountId : existAccount.id,
            email: existAccount.email,
            version: 1,
        }
        const privateKey = fs.readFileSync('src/rs256key/private.pem');
        const accessToken = jwt.sign({
            payload, 
        }, privateKey, {
            algorithm: 'RS256',
            expiresIn: '15m',
        });

        const refeshToken = jwt.sign({
            payload,
        }, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7d',
        });
        return {accessToken, refeshToken};
    }

    async refresh(refreshToken: string) {
        const publicKey = fs.readFileSync('src/rs256key/public.pem');
        const privateKey = fs.readFileSync('src/rs256key/private.pem');
        const decodedToken = jwt.verify(refreshToken, publicKey) as any;
        if(!decodedToken) {
            throw new BadRequestException("Invalid refresh token");
        }
        const payload = decodedToken.payload;
        const newAccessToken = jwt.sign({
            payload,
        }, privateKey, {
            algorithm: 'RS256',
            expiresIn: '15m',
        });
        return {newAccessToken};
    }

    

}