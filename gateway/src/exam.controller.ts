import { Body, Controller, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./interfaces/payload";
import FormData from "form-data";
import {
    CreateExamDto,
    UpdateExamDto,
    CreatePartDto,
    CreateQuestionGroupDto,
    CreateQuestionInGroupDto,
    CreateSeparateQuestionDto,
    CreateSubmitDto,
    SubmitAnswersDto,
    FinishSessionDto,
    ExamResponse,
    ExamTypeResponse,
    PartResponse,
    QuestionGroupResponse,
    QuestionResponse,
    SessionResponse,
    SubmitAnswersResponse,
    FinishSessionResponse,
    TopicAnalysisEntry,
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
    @ApiResponse({ status: 200, description: "List of published exams", type: ApiResponse })
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

    @Post(":examId/part")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Create a part within an exam" })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiBody({ type: CreatePartDto })
    @ApiResponse({ status: 201, description: "Part created" })
    async createPart(@Body() body: CreatePartDto, @Param("examId") examId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/${examId}`, body);
        return (await result).data;
    }

    @Get("parts/exam/:examId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get all parts for an exam" })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiResponse({ status: 200, description: "List of parts" })
    async findPartsByExam(@Param("examId") examId: string) {
        const result = axios.get(`${this.examUrl}/parts/exam/${examId}`);
        return (await result).data;
    }

    @Get("part/:partId")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get part with question groups and questions" })
    @ApiParam({ name: "partId", description: "Part UUID" })
    @ApiResponse({ status: 200, description: "Part details" })
    async findPartWithQuestionGroups(@Param("partId") partId: string) {
        const result = axios.get(`${this.examUrl}/parts/${partId}`);
        return (await result).data;
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

    @Post("part/:partId/question")
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Create a standalone question in a part" })
    @ApiParam({ name: "partId", description: "Part UUID" })
    @ApiBody({ type: CreateSeparateQuestionDto })
    @ApiResponse({ status: 201, description: "Question created", type: QuestionResponse })
    async createQuestion(@Body() body: CreateSeparateQuestionDto, @Param("partId") partId: string, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.examUrl}/question/part/${partId}`, body);
        return (await result).data;
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

    @Get("topics")
    @ApiOperation({ summary: "Get all topics (paginated)" })
    @ApiResponse({ status: 200, description: "Paginated list of topics" })
    async findAllTopics(
        @Query("page") page: string = "1",
        @Query("limit") limit: string = "20",
    ) {
        const result = axios.get(`${this.examUrl}/topics?page=${page}&limit=${limit}`);
        return (await result).data;
    }
}
