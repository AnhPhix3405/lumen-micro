import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Exam } from "src/entities/exams.entity";
import { Repository } from "typeorm";

@Injectable()
export class ModerationService {
    constructor(
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
    ) { }

    async approveExam(examId: string) {
        const exam = await this.examRepository.findOne({ where: { id: examId } });
        if (!exam) throw new NotFoundException("Exam not found");
        if (exam.visibility !== "pending") throw new Error("Exam is not in pending state");
        exam.visibility = "public";
        exam.isPublished = true;
        return await this.examRepository.save(exam);
    }

    async rejectExam(examId: string) {
        const exam = await this.examRepository.findOne({ where: { id: examId } });
        if (!exam) throw new NotFoundException("Exam not found");
        if (exam.visibility !== "pending") throw new Error("Exam is not in pending state");
        exam.visibility = "rejected";
        return await this.examRepository.save(exam);
    }
}
