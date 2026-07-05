import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "../interfaces/payload";
import {
    CreatePartDto,
    ApiResponse as ApiSuccessResponse,
} from "../dto/exam.dto";

@ApiBearerAuth("JWT")
@ApiTags("Exam")
@Controller("exam")
export class PartController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
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
}
