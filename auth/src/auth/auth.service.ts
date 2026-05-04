import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { AccountsService } from "src/accounts/accounts.service";
import { EmailService } from "src/services/email.service";
import { redisClient } from "src/configs/redisClient.config";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthAccount } from "src/accounts/accounts.entity";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        @Inject('EVENT_BUS')
        private client: ClientProxy,
        private readonly accountsService: AccountsService,
        private readonly emailService: EmailService,
        @InjectRepository(AuthAccount) private readonly accountRepository: Repository<AuthAccount>,
    ) { }
    // ---AUTH MODULE---
    async createAccount(email: string, password: string) {
        const hashedPassword = await this.hashPassword(password);
        const account = await this.accountsService.createAccount({
            email: email,
            password_hash: hashedPassword,
        });
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        await redisClient.set(`verify_email:${email}`, code);
        await redisClient.expire(`verify_email:${email}`, 300);
        this.emailService.sendVerificationCode(email, code);
        this.client.emit('account_created', {
            accountId: account.id,
            email: account.email,
        });
        return account;
    }

    async hashPassword(password: string) {
        const saltRounds = Number(this.configService.get<string>('SALT_ROUNDS'));
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    }

    async verifyAccount(email: string, code: string) {
        const storedCode = await redisClient.get(`verify_email:${email}`);
        if (!storedCode) {
            throw new BadRequestException("Verification code expired");
        }
        if (storedCode !== code) {
            throw new BadRequestException("Invalid verification code");
        }
        await this.accountsService.verifyAccount(email);
        await redisClient.del(`verify_email:${email}`);
    }

    async login(email: string, password: string) {
        const existAccount = await this.accountsService.getAccountByEmail(email);
        if (!existAccount) {
            throw new BadRequestException("Account not found");
        }
        const isPasswordValid = await bcrypt.compare(password, existAccount.password_hash);
        if (!isPasswordValid) {
            throw new BadRequestException("Invalid password");
        }
        const payload = {
            accountId: existAccount.id,
            email: existAccount.email,
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
        return { accessToken, refeshToken };
    }

    async refresh(refreshToken: string) {
        const publicKey = fs.readFileSync('src/rs256key/public.pem');
        const privateKey = fs.readFileSync('src/rs256key/private.pem');
        const decodedToken = jwt.verify(refreshToken, publicKey) as any;
        if (!decodedToken) {
            throw new BadRequestException("Invalid refresh token");
        }
        const payload = decodedToken.payload;
        const newAccessToken = jwt.sign({
            payload,
        }, privateKey, {
            algorithm: 'RS256',
            expiresIn: '15m',
        });
        return { newAccessToken };
    }

    //---USER MODULE---
    async changePassword(accountId: string, oldPassword: string, newPassword: string) {
        const account = await this.accountRepository.findOne({ where: { id: accountId } });
        if (!account) {
            throw new BadRequestException("Account not found");
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, account.password_hash);
        if (!isPasswordValid) {
            throw new BadRequestException("Invalid password");
        }
        account.password_hash = await this.hashPassword(newPassword);
        await this.accountRepository.save(account);
    }

    async sendResetPasswordCode(email: string) {
        const existAccount = await this.accountsService.getAccountByEmail(email);
        if (!existAccount) {
            throw new BadRequestException("Account not found");
        }
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        await redisClient.set(`reset_password:${email}`, code);
        await redisClient.expire(`reset_password:${email}`, 300);
        await this.emailService.sendVerificationCode(email, code);
    }

    async verifyResetPassword(email: string, code: string) {
        const storedCode = await redisClient.get(`reset_password:${email}`);
        if (!storedCode) {
            throw new BadRequestException("Verification code expired");
        }
        if (storedCode !== code) {
            throw new BadRequestException("Invalid verification code");
        }
        await redisClient.del(`reset_password:${email}`);
        const resetToken = randomBytes(32).toString('hex');
        await redisClient.set(`reset_password_token:${email}`, resetToken);
        await redisClient.expire(`reset_password_token:${email}`, 180);
    }

    async resetPassword(email: string, resetToken: string, password: string) {
        const existAccount = await this.accountsService.getAccountByEmail(email);
        if (!existAccount) {
            throw new BadRequestException("Account not found");
        }
        const storedToken = await redisClient.get(`reset_password_token:${email}`);
        if (!storedToken) {
            throw new BadRequestException("Reset token expired");
        }
        if (storedToken !== resetToken) {
            throw new BadRequestException("Invalid reset token");
        }
        await redisClient.del(`reset_password_token:${email}`);
        existAccount.password_hash = await this.hashPassword(password);
        await this.accountRepository.save(existAccount);
    }

}