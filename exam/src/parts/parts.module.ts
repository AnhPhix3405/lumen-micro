import { Module } from "@nestjs/common";
import { PartsController } from "./parts.controller";
import { PartsService } from "./parts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Part } from "src/entities/parts.entity";
import { Exam } from "src/entities/exams.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Part, Exam])],
    controllers: [PartsController],
    providers: [PartsService]
})
export class PartsModule { }