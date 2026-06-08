import { Body, Controller, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./interfaces/payload";
import FormData from "form-data";
@Controller("exam")
export class ExamController {
    constructor(private readonly config: ConfigService) { }
    @Post()
    @UseGuards(JwtAuthGuard)
    //@desc create exam
    async createExam(@Body() body: any, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}`, body);
        return (await result).data;
    }

    @Post(":examId/part")
    @UseGuards(JwtAuthGuard)
    async createPart(@Body() body: any, @Param("examId") examId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/${examId}`, body);
        return (await result).data;
    }

    @Post("part/:partId/question-group")
    @UseGuards(JwtAuthGuard)
    async createQuestionGroup(@Body() body: any, @Param("partId") partId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/question-group/${partId}`, body);
        return (await result).data;
    }

    @Patch("question-group/:questionGroupId/upload-audio")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    async uploadQuestionGroupAudio(
        @UploadedFile() file: Express.Multer.File,
        @Param("questionGroupId") questionGroupId: string,
        @Req() req: Request & { payload: TokenPayload }
    ) {
        const formData = new FormData();
        formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
        const result = axios.patch(
            `${this.config.get("EXAM_SERVICE_URL")}/question-group/${questionGroupId}/upload-audio`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "x-user-id": req.payload.payload.userId,
                },
            }
        );
        return (await result).data;
    }

    @Post("question-group/:questionGroupId/question")
    @UseGuards(JwtAuthGuard)
    async createQuestionInGroup(@Body() body: any, @Param("questionGroupId") questionGroupId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        Object.assign(body, { questionGroupId });
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/question/question-group/${questionGroupId}`, body);
        return (await result).data;
    }

    @Post("part/:partId/question")
    @UseGuards(JwtAuthGuard)
    async createQuestion(@Body() body: any, @Param("partId") partId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/question/part/${partId}`, body);
        return (await result).data;
    }


    @Post("create-session/:examId")
    @UseGuards(JwtAuthGuard)
    async createSubmit(@Body() body: any, @Req() req: Request & { payload: TokenPayload }, @Param("examId") examId: string) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/session/create/${examId}`, body);
        return (await result).data;
    }

    @Post("submit-answers/:sessionId")
    @UseGuards(JwtAuthGuard)
    async submitAnswers(@Body() body: any, @Param("sessionId") sessionId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/session/submit-answers/${sessionId}`, body);
        return (await result).data;
    }

    @Post("finish-session/:sessionId")
    @UseGuards(JwtAuthGuard)
    async finishSession(@Body() body: any, @Param("sessionId") sessionId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}/session/finish/${sessionId}`, body);
        return (await result).data;
    }
}