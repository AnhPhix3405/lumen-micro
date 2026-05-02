import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { redisClient } from "src/configs/redisClient.config";
@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: this.configService.get<string>("EMAIL_USER"),
                pass: this.configService.get<string>("EMAIL_PASS"),
            },
        });
    }

    async sendVerificationCode(email: string, code: string) {
        await this.transporter.sendMail({
            from: this.configService.get<string>("EMAIL_USER"),
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${code}`,
        });
    }
}