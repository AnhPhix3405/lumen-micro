import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import * as crypto from 'crypto';
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import {v2 as cloudinary} from "cloudinary";
import { JwtAuthGuard } from "src/auth/jwt_auth.guard";
import { IToken } from "src/intefaces/token.interface";
interface RequestWithUser extends Request {
  user: IToken;
}
@Controller('/user')
export class UsersController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    @Get()
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    @Post("/cloudinary/webhook")
    async handleCloudinaryWebhook(@Req() req: Request, @Res() res: Response) {
        const secretKey = this.configService.get<string>('CLOUDINARY_SECRET_KEY');

        // 1. Lấy đúng tên Header từ mẫu bạn gửi (Lưu ý: Header trong Express tự convert về chữ thường)
        const signature = req.headers['x-cld-signature'] as string;
        const timestamp = req.headers['x-cld-timestamp'] as string;

        if (!signature || !timestamp) {
            throw new UnauthorizedException('Missing signature or timestamp');
        }

        // 2. Kiểm tra Signature (Thuật toán chuẩn của Cloudinary cho Notification)
        // Cách tính: SHA1 của [Payload (JSON string) + Timestamp + API_Secret]
        const payload = JSON.stringify(req.body);
        const toHash = payload + timestamp + secretKey;
        const expectedSignature = crypto
            .createHash('sha1')
            .update(toHash)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid Webhook Signature!');
            return res.status(401).send('Invalid signature');
        }

        // 3. Trích xuất dữ liệu dựa trên mẫu JSON bạn cung cấp
        const {
            notification_type,
            public_id,
            secure_url,
            resource_type,
            original_filename
        } = req.body;

        console.log(`Nhận event: ${notification_type} cho file: ${original_filename}`);

        try {
            if (notification_type === 'upload') {
                console.log('Upload thành công. URL:', secure_url);

                // Logic ví dụ: Cập nhật database
                // await this.userRepository.update({ publicId: public_id }, { avatar: secure_url });

            } else if (notification_type === 'delete') {
                console.log('Asset bị xóa:', public_id);
                // Logic xóa tương ứng trong DB
            }

            // 4. Trả về 200 OK để Cloudinary không gửi lại webhook (retry)
            return res.status(200).send('OK');

        } catch (error) {
            console.error('Lỗi xử lý Database:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    @Post('signed-upload-url')
    @UseGuards(JwtAuthGuard)
    getSignedUploadUrl(@Req() req: RequestWithUser,@Body() body: { folder?: string; publicId?: string }, @Res() res: Response) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uploadPreset = 'lumen';
        const folder = body.folder || 'lumen';
        const userToken = req?.user as IToken;
        const publicId = userToken.accountId + '_' + Date.now().toString();

        const params = {
            timestamp: timestamp,
            folder: folder,
            public_id: publicId,
            upload_preset: uploadPreset
        };

        // Generate signature
        const signature = cloudinary.utils.api_sign_request(
            params,
            this.configService.get<string>('CLOUDINARY_SECRET_KEY') || ''
        );

        // Return the data needed for the frontend to construct the upload URL
        res.json({
            url: `https://api.cloudinary.com/v1_1/${this.configService.get<string>('CLOUDINARY_CLOUD_NAME')}/image/upload`,
            formData: {
                ...params,
                api_key: this.configService.get<string>('CLOUDINARY_SECRET_KEY'),
                signature: signature,
                timestamp: timestamp
            }
        });
    }

}