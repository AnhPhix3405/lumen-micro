import { Post, Req } from "@nestjs/common";
import type { Request } from "express";

import { UploadService } from "./upload.service";

export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post("question-groups/media")
    async uploadQuestionGroupMedia(
        @Req() req: Request,
    ) {
        const files =
            await this.uploadService
                .uploadQuestionGroupMedia(req);

        return {
            message: "Upload successful",
            data: files,
        };
    }
}