import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./interfaces/payload";
import {
    CreateExamDto,
    UpdateExamDto,
    ExamResponse,
    ExamTypeResponse,
    ApiResponse as ApiSuccessResponse,
} from "./dto/exam.dto";

@ApiBearerAuth("JWT")
@ApiTags("Exam")
@Controller("exam")
export class ExamController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Create a new exam" })
    @ApiBody({ type: CreateExamDto })
    @ApiResponse({ status: 201, description: "Exam created" })
    async createExam(@Body() body: CreateExamDto, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}`, body);
        return (await result).data;
    }

    @Patch("update/:examId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Update an exam" })
    @ApiBody({ type: UpdateExamDto })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiResponse({ status: 200, description: "Exam updated" })
    async updateExam(@Body() body: UpdateExamDto, @Req() req: Request & { payload: TokenPayload }, @Param("examId") examId: string) {
        Object.assign(body, req.payload);
        Object.assign(body, { examId });
        const result = axios.patch(`${this.examUrl}`, body);
        return (await result).data;
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "List all published exams" })
    @ApiResponse({ status: 200, description: "List of published exams", type: ApiSuccessResponse })
    async findAllPublished() {
        const result = axios.get(`${this.examUrl}`);
        return (await result).data;
    }

    @Get("my")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get current user's own exams" })
    @ApiResponse({ status: 200, description: "User's exams" })
    async findMyExams(@Req() req: Request & { payload: TokenPayload }) {
        const result = axios.get(`${this.examUrl}/my/all`, {
            headers: {
                "x-user-id": req.payload.payload.userId,
                "x-account-id": req.payload.payload.accountId,
            },
        });
        return (await result).data;
    }

    @Get("exam-types")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "List all exam types" })
    @ApiResponse({ status: 200, description: "List of exam types" })
    async findAllExamTypes() {
        const result = axios.get(`${this.examUrl}/exam-types`);
        return (await result).data;
    }

    @Get("exam-types/:id")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get exam type by ID" })
    @ApiParam({ name: "id", description: "Exam type UUID" })
    @ApiResponse({ status: 200, description: "Exam type details" })
    async findExamTypeById(@Param("id") id: string) {
        const result = axios.get(`${this.examUrl}/exam-types/${id}`);
        return (await result).data;
    }

    @Post("publish/request")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Request publishing for an exam" })
    @ApiResponse({ status: 200, description: "Publish request submitted" })
    async requestPublishing(@Body() body: { examId: string }, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/publish/request`, body);
        return (await result).data;
    }

    @Get(":examId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get full exam tree with parts, groups, and questions" })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiResponse({ status: 200, description: "Full exam tree" })
    async findOneWithFullTree(@Param("examId") examId: string) {
        const result = axios.get(`${this.examUrl}/${examId}`);
        return (await result).data;
    }
}
