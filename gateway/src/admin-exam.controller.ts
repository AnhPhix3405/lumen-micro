import { Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./interfaces/payload";

@ApiBearerAuth("JWT")
@ApiTags("Admin")
@Controller("admin")
export class AdminExamController {
    constructor(private readonly config: ConfigService) { }

    private get examUrl() {
        return this.config.get("EXAM_SERVICE_URL");
    }

    @Patch("exams/:examId/publish")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiOperation({ summary: "Approve an exam for publishing" })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiResponse({ status: 200, description: "Exam published" })
    async approveExam(@Param("examId") examId: string, @Req() req: Request & { payload: TokenPayload }) {
        const result = axios.patch(`${this.examUrl}/admin/exams/${examId}/publish`, {}, {
            headers: {
                "x-user-id": req.payload.payload.userId,
                "x-account-id": req.payload.payload.accountId,
            },
        });
        return (await result).data;
    }

    @Patch("exams/:examId/reject")
    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiOperation({ summary: "Reject an exam from publishing" })
    @ApiParam({ name: "examId", description: "Exam UUID" })
    @ApiResponse({ status: 200, description: "Exam rejected" })
    async rejectExam(@Param("examId") examId: string, @Req() req: Request & { payload: TokenPayload }) {
        const result = axios.patch(`${this.examUrl}/admin/exams/${examId}/reject`, {}, {
            headers: {
                "x-user-id": req.payload.payload.userId,
                "x-account-id": req.payload.payload.accountId,
            },
        });
        return (await result).data;
    }
}
