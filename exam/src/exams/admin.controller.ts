import { Controller, Param, Patch } from "@nestjs/common";
import { ModerationService } from "./moderation.service";

@Controller("admin/exams")
export class AdminExamController {
    constructor(private readonly moderationService: ModerationService) { }

    @Patch(":examId/publish")
    async approveExam(@Param("examId") examId: string) {
        const data = await this.moderationService.approveExam(examId);
        return { data, message: "Exam published successfully" };
    }

    @Patch(":examId/reject")
    async rejectExam(@Param("examId") examId: string) {
        const data = await this.moderationService.rejectExam(examId);
        return { data, message: "Exam rejected successfully" };
    }
}
