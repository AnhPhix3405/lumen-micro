import {
    BadRequestException,
    Injectable,
} from "@nestjs/common";

import busboy from "busboy";
import cloudinary from "cloudinary";
import { Request } from "express";

const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 3,
    FOLDER: "lumen/question-groups",
} as const;

@Injectable()
export class UploadService {
    async uploadQuestionGroupMedia(
        req: Request,
    ): Promise<cloudinary.UploadApiResponse[]> {
        return this.processUpload(req);
    }

    private processUpload(
        req: Request,
    ): Promise<cloudinary.UploadApiResponse[]> {
        return new Promise((resolve, reject) => {
            const bb = busboy({
                headers: req.headers,
                limits: {
                    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
                    files: UPLOAD_CONFIG.MAX_FILES,
                },
            });

            const uploads: Promise<cloudinary.UploadApiResponse>[] = [];

            let aborted = false;

            bb.on("file", (_field, file) => {
                if (aborted) {
                    file.resume();
                    return;
                }

                const uploadPromise = this.handleFileUpload(file)
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
                        `Maximum ${UPLOAD_CONFIG.MAX_FILES} files allowed`,
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
        file: NodeJS.ReadableStream,
    ): Promise<cloudinary.UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream =
                cloudinary.v2.uploader.upload_stream(
                    {
                        folder: UPLOAD_CONFIG.FOLDER,
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
                        `File size exceeded ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
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