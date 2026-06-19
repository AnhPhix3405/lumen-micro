import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePartDto, UpdatePartDto } from "src/dto/part_module.dto";
import { Part } from "src/entities/parts.entity";
import { BodyTokenPayload } from "src/interfaces/payload";
import { Exam } from "src/entities/exams.entity";

@Injectable()
export class PartsService {
    constructor(
        @InjectRepository(Part) private readonly partRepository: Repository<Part>,
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
    ) { }

    async create(params: CreatePartDto & BodyTokenPayload & { examId: string }) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        const part = this.partRepository.create({
            name: params.name,
            examId: params.examId,
            type: params.type,
            instruction: params.instruction,
            score: params.score,
            partOrder: params.partOrder,
        });
        return await this.partRepository.save(part);
    }

    async update(params: UpdatePartDto & BodyTokenPayload & { partId: string }) {
        const part = await this.partRepository.findOne({ where: { id: params.partId } });
        if (!part) {
            throw new Error("Part not found");
        }
        const exam = await this.examRepository.findOne({ where: { id: part.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }

        part.name ??= params.name;
        return await this.partRepository.save(part);
    }

    async delete(params: { partId: string } & BodyTokenPayload) {
        const part = await this.partRepository.findOne({ where: { id: params.partId } });
        if (!part) {
            throw new Error("Part not found");
        }
        const exam = await this.examRepository.findOne({ where: { id: part.examId } });
        if (!exam) {
            throw new Error("Exam not found");
        }
        if (exam.userId !== params.payload.userId) {
            throw new Error("Unauthorized");
        }
        return await this.partRepository.delete(part.id);
    }


    async findOneById(id: string) {
        const part = await this.partRepository.findOne({ where: { id }, relations: { exam: true } });
        if (!part) {
            throw new NotFoundException("Part not found");
        }
        return part;
    }

    async findByExamId(examId: string) {
        return await this.partRepository.find({
            where: { examId },
            relations: { questionGroups: true },
            order: { partOrder: "ASC" },
        });
    }

    async findOneWithQuestionGroups(id: string) {
        const part = await this.partRepository.findOne({
            where: { id },
            relations: {
                questionGroups: {
                    questions: true,
                },
                questions: true,
            },
            order: {
                questionGroups: { groupOrder: "ASC" },
                questions: { questionOrder: "ASC" },
            },
        });
        if (!part) {
            throw new NotFoundException("Part not found");
        }
        return part;
    }
}
