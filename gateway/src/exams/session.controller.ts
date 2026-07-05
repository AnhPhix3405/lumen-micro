import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "../interfaces/payload";
import {
    CreateSubmitDto,
    SubmitAnswersDto,
    FinishSessionDto,
    SessionResponse,
    SubmitAnswersResponse,
    FinishSessionResponse,
    TopicAnalysisEntry,
    ApiResponse as ApiSuccessResponse,
} from "../dto/exam.dto";

@ApiBearerAuth("JWT")
@ApiTags("Exam")
@Controller("exam")
export class SessionController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
    }

    @Post("create-session/:examId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Start a new exam session" })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiBody({ type: CreateSubmitDto })
    @ApiResponse({ status: 201, description: "Session created" })
    async createSubmit(@Body() body: CreateSubmitDto, @Req() req: Request & { payload: TokenPayload }, @Param("examId") examId: string) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/session/create/${examId}`, body);
        return (await result).data;
    }

    @Post("submit-answers/:sessionId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Submit answers for an in-progress session" })
    @ApiParam({ name: "sessionId", description: "Session UUID" })
    @ApiBody({ type: SubmitAnswersDto })
    @ApiResponse({ status: 200, description: "Answers saved" })
    async submitAnswers(@Body() body: SubmitAnswersDto, @Param("sessionId") sessionId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/session/submit-answers/${sessionId}`, body);
        return (await result).data;
    }

    @Post("finish-session/:sessionId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Finish a session and calculate score" })
    @ApiParam({ name: "sessionId", description: "Session UUID" })
    @ApiBody({ type: FinishSessionDto })
    @ApiResponse({ status: 200, description: "Session finished with score" })
    async finishSession(@Body() body: FinishSessionDto, @Param("sessionId") sessionId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/session/finish/${sessionId}`, body);
        return (await result).data;
    }

    @Get("session/:sessionId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get session details with answers" })
    @ApiParam({ name: "sessionId", description: "Session UUID" })
    @ApiResponse({ status: 200, description: "Session details" })
    async findSession(@Param("sessionId") sessionId: string, @Req() req: Request & { payload: TokenPayload }) {
        const result = axios.get(`${this.examUrl}/session/${sessionId}`, {
            headers: {
                "x-user-id": req.payload.payload.userId,
                "x-account-id": req.payload.payload.accountId,
            },
        });
        return (await result).data;
    }

    @Get("sessions/my")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get current user's all sessions" })
    @ApiResponse({ status: 200, description: "User's sessions" })
    async findUserSessions(@Req() req: Request & { payload: TokenPayload }) {
        const result = axios.get(`${this.examUrl}/session/user/all`, {
            headers: {
                "x-user-id": req.payload.payload.userId,
                "x-account-id": req.payload.payload.accountId,
            },
        });
        return (await result).data;
    }

    @Get("session/:sessionId/topic-analysis")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get topic analysis for a session (optional ?partId filter)" })
    @ApiParam({ name: "sessionId", description: "Session UUID" })
    @ApiQuery({ name: "partId", required: false, description: "Filter by part UUID" })
    @ApiResponse({ status: 200, description: "Topic analysis", type: [TopicAnalysisEntry] })
    async topicAnalysis(
        @Param("sessionId") sessionId: string,
        @Query("partId") partId: string | undefined,
        @Req() req: Request & { payload: TokenPayload }
    ) {
        const url = partId
            ? `${this.examUrl}/session/${sessionId}/topic-analysis?partId=${partId}`
            : `${this.examUrl}/session/${sessionId}/topic-analysis`;
        const result = axios.get(url, {
            headers: {
                "x-user-id": req.payload.payload.userId,
                "x-account-id": req.payload.payload.accountId,
            },
        });
        return (await result).data;
    }
}
