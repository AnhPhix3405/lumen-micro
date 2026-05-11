import {
    BadRequestException,
    Injectable,
} from "@nestjs/common";

import busboy from "busboy";
import cloudinary from "cloudinary";
import { Request } from "express";
interface IUploadConfig {
    MAX_FILE_SIZE: number;
    MAX_FILES: number;
}


@Injectable()
export class UploadService {
    async uploadQuestionGroupAudio(
        req: Request, userId: string
    ): Promise<string> {
        const uploadConfig: IUploadConfig = {
            MAX_FILE_SIZE: 5 * 1024 * 1024,
            MAX_FILES: 1,
        };
        const url = await this.processUpload(req, userId, "question-groups", uploadConfig);
        return url[0].secure_url;
    }

    private processUpload(
        req: Request, userId: string, folderPath: string, uploadConfig: IUploadConfig
    ): Promise<cloudinary.UploadApiResponse[]> {
        return new Promise((resolve, reject) => {
            const bb = busboy({
                headers: req.headers,
                limits: {
                    fileSize: uploadConfig.MAX_FILE_SIZE,
                    files: uploadConfig.MAX_FILES,
                },
            });

            const uploads: Promise<cloudinary.UploadApiResponse>[] = [];

            let aborted = false;

            bb.on("file", (_field, file) => {
                if (aborted) {
                    file.resume();
                    return;
                }

                const uploadPromise = this.handleFileUpload(file, userId, folderPath, uploadConfig)
                    .catch((error) => {
                        aborted = true;
                        reject(error);
                        throw error;
                    });

                uploads.push(uploadPromise);
            });

            bb.on("finish", async () => {
                if (aborted) {
                    return;
                }

                try {
                    const results = await Promise.all(uploads);

                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            });

            bb.on("filesLimit", () => {
                aborted = true;

                reject(
                    new BadRequestException(
                        `Maximum ${uploadConfig.MAX_FILES} files allowed`,
                    ),
                );
            });

            bb.on("error", (error) => {
                aborted = true;
                reject(error);
            });

            req.pipe(bb);
        });
    }

    private handleFileUpload(
        file: NodeJS.ReadableStream, userId: string, folderPath: string, uploadConfig: IUploadConfig
    ): Promise<cloudinary.UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream =
                cloudinary.v2.uploader.upload_stream(
                    {
                        folder: `lumen/${userId}/${folderPath}`,
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }

                        if (!result) {
                            return reject(
                                new BadRequestException(
                                    "Upload failed",
                                ),
                            );
                        }

                        resolve(result);
                    },
                );

            file.on("limit", () => {
                uploadStream.destroy();

                reject(
                    new BadRequestException(
                        `File size exceeded ${uploadConfig.MAX_FILE_SIZE / 1024 / 1024}MB`,
                    ),
                );
            });

            file.on("error", (error) => {
                uploadStream.destroy();
                reject(error);
            });

            file.pipe(uploadStream);
        });
    }
}