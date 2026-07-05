import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@ApiTags("Exam")
@Controller("exam")
export class TopicController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
    }

    @Get("topics")
    @ApiOperation({ summary: "Get all topics (paginated)" })
    @ApiQuery({ name: "page", required: false, example: "1" })
    @ApiQuery({ name: "limit", required: false, example: "20" })
    @ApiResponse({ status: 200, description: "Paginated list of topics" })
    async findAllTopics(
        @Query("page") page: string = "1",
        @Query("limit") limit: string = "20",
    ) {
        const result = axios.get(`${this.examUrl}/topics?page=${page}&limit=${limit}`);
        return (await result).data;
    }

    @Get("topics/question/:questionId")
    @ApiOperation({ summary: "Get all topics of a question" })
    @ApiParam({ name: "questionId", description: "Question UUID" })
    @ApiResponse({ status: 200, description: "List of topics for the question" })
    async findTopicsByQuestion(@Param("questionId") questionId: string) {
        const result = axios.get(`${this.examUrl}/topics/question/${questionId}`);
        return (await result).data;
    }
}
