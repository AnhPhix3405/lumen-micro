// cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    async uploadBuffer(file: Express.Multer.File, accountId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `lumen/${accountId}/avatar`,
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            // 🔹 convert buffer → stream
            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);

            // 🔹 pipe vào cloudinary
            bufferStream.pipe(stream);
        });
    }
}