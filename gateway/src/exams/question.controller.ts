import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "../interfaces/payload";
import FormData from "form-data";
import { CreateSeparateQuestionDto as CreateQuestionDto, UpdateQuestionDto, UpdateQuestionTopicsDto } from "../dto/exam.dto";

@ApiBearerAuth("JWT")
@ApiTags("Exam Question")
@Controller("exam/question")
export class QuestionController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
    }

    @Post("by-part/:partId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Create a standalone question in a part" })
    @ApiParam({ name: "partId", description: "Part UUID" })
    @ApiBody({ type: CreateQuestionDto })
    @ApiResponse({ status: 201, description: "Question created" })
    async createStandaloneQuestion(@Body() body: CreateQuestionDto, @Param("partId") partId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        Object.assign(body, { partId });
        const result = axios.post(`${this.examUrl}/question/part/${partId}`, body);
        return (await result).data;
    }

    @Get("by-group/:questionGroupId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get all questions in a question group" })
    @ApiParam({ name: "questionGroupId", description: "Question group UUID" })
    @ApiResponse({ status: 200, description: "List of questions" })
    async findQuestionsByGroup(@Param("questionGroupId") questionGroupId: string) {
        const result = axios.get(`${this.examUrl}/question/by-group/${questionGroupId}`);
        return (await result).data;
    }

    @Get("by-part/:partId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get standalone questions in a part" })
    @ApiParam({ name: "partId", description: "Part UUID" })
    @ApiResponse({ status: 200, description: "List of questions" })
    async findQuestionsByPart(@Param("partId") partId: string) {
        const result = axios.get(`${this.examUrl}/question/by-part/${partId}`);
        return (await result).data;
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get a single question by ID" })
    @ApiParam({ name: "id", description: "Question UUID" })
    @ApiResponse({ status: 200, description: "Question details" })
    async findQuestion(@Param("id") id: string) {
        const result = axios.get(`${this.examUrl}/question/${id}`);
        return (await result).data;
    }

    @Patch(":questionId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Update a question" })
    @ApiParam({ name: "questionId", description: "Question UUID" })
    @ApiBody({ type: UpdateQuestionDto })
    @ApiResponse({ status: 200, description: "Question updated" })
    async updateQuestion(@Body() body: UpdateQuestionDto, @Param("questionId") questionId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload, { questionId });
        const result = axios.patch(`${this.examUrl}/question/${questionId}`, body);
        return (await result).data;
    }

    @Patch(":questionId/upload-audio")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    @ApiOperation({ summary: "Upload audio file for a question" })
    @ApiParam({ name: "questionId", description: "Question UUID" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: { type: "string", format: "binary" },
            },
        },
    })
    @ApiResponse({ status: 200, description: "Audio uploaded" })
    async uploadQuestionAudio(
        @UploadedFile() file: Express.Multer.File,
        @Param("questionId") questionId: string,
        @Req() req: Request & { payload: TokenPayload }
    ) {
        const formData = new FormData();
        formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
        const result = axios.patch(
            `${this.examUrl}/question/${questionId}/upload-audio`,
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

    @Patch(":questionId/upload-image")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    @ApiOperation({ summary: "Upload image file for a question" })
    @ApiParam({ name: "questionId", description: "Question UUID" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: { type: "string", format: "binary" },
            },
        },
    })
    @ApiResponse({ status: 200, description: "Image uploaded" })
    async uploadQuestionImage(
        @UploadedFile() file: Express.Multer.File,
        @Param("questionId") questionId: string,
        @Req() req: Request & { payload: TokenPayload }
    ) {
        const formData = new FormData();
        formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
        const result = axios.patch(
            `${this.examUrl}/question/${questionId}/upload-image`,
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

    @Patch(":questionId/topics")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Replace topics on a question" })
    @ApiParam({ name: "questionId", description: "Question UUID" })
    @ApiBody({ type: UpdateQuestionTopicsDto })
    @ApiResponse({ status: 200, description: "Topics updated" })
    async updateQuestionTopics(
        @Body() body: UpdateQuestionTopicsDto,
        @Param("questionId") questionId: string,
        @Req() req: Request & { payload: TokenPayload }
    ) {
        Object.assign(body, req.payload);
        const result = axios.patch(`${this.examUrl}/question/${questionId}/topics`, body);
        return (await result).data;
    }
}
