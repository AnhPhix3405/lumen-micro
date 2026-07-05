import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "../interfaces/payload";
import FormData from "form-data";
import {
    CreateQuestionGroupDto,
    CreateQuestionInGroupDto,
    ApiResponse as ApiSuccessResponse,
} from "../dto/exam.dto";

@ApiBearerAuth("JWT")
@ApiTags("Exam")
@Controller("exam")
export class QuestionGroupController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
    }

    @Post("part/:partId/question-group")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Create a question group within a part" })
    @ApiParam({ name: "partId", description: "Part UUID" })
    @ApiBody({ type: CreateQuestionGroupDto })
    @ApiResponse({ status: 201, description: "Question group created" })
    async createQuestionGroup(@Body() body: CreateQuestionGroupDto, @Param("partId") partId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/question-group/${partId}`, body);
        return (await result).data;
    }

    @Get("question-group/part/:partId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get all question groups for a part" })
    @ApiParam({ name: "partId", description: "Part UUID" })
    @ApiResponse({ status: 200, description: "List of question groups" })
    async findGroupsByPart(@Param("partId") partId: string) {
        const result = axios.get(`${this.examUrl}/question-group/part/${partId}`);
        return (await result).data;
    }

    @Get("question-group/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get a question group with its questions" })
    @ApiParam({ name: "id", description: "Question group UUID" })
    @ApiResponse({ status: 200, description: "Question group details" })
    async findGroupWithQuestions(@Param("id") id: string) {
        const result = axios.get(`${this.examUrl}/question-group/${id}`);
        return (await result).data;
    }

    @Patch("question-group/:questionGroupId/upload-audio")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor("file"))
    @ApiOperation({ summary: "Upload audio file for a question group" })
    @ApiParam({ name: "questionGroupId", description: "Question group UUID" })
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
    async uploadQuestionGroupAudio(
        @UploadedFile() file: Express.Multer.File,
        @Param("questionGroupId") questionGroupId: string,
        @Req() req: Request & { payload: TokenPayload }
    ) {
        const formData = new FormData();
        formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
        const result = axios.patch(
            `${this.examUrl}/question-group/${questionGroupId}/upload-audio`,
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
    @ApiOperation({ summary: "Create a question inside a question group" })
    @ApiParam({ name: "questionGroupId", description: "Question group UUID" })
    @ApiBody({ type: CreateQuestionInGroupDto })
    @ApiResponse({ status: 201, description: "Question created" })
    async createQuestionInGroup(@Body() body: CreateQuestionInGroupDto, @Param("questionGroupId") questionGroupId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        Object.assign(body, { questionGroupId });
        const result = axios.post(`${this.examUrl}/question/question-group/${questionGroupId}`, body);
        return (await result).data;
    }
}
