import { InjectRepository } from "@nestjs/typeorm";
import { CreatePartDto, UpdatePartDto } from "src/dto/part_module.dto";
import { Part } from "src/entities/parts.entity";
import { BodyTokenPayload } from "src/interfaces/payload";
import { Exam } from "src/entities/exams.entity";
import { Repository } from "typeorm";


export class PartsService {
    constructor(@InjectRepository(Part) private readonly partRepository: Repository<Part>,
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
    ) { }

    async create(params: CreatePartDto) {
        const part = this.partRepository.create({
            name: params.name,

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
        return await this.partRepository.delete(part);
    }
}