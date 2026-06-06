import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { PartsService } from "./parts.service";
import { CreatePartDto, UpdatePartDto } from "src/dto/part_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";

@Controller()
export class PartsController {
    constructor(private readonly partsService: PartsService) { }
    @Post("/:examId")
    async createPart(@Body() body: CreatePartDto & BodyTokenPayload, @Param("examId") examId: string) {
        const combined = Object.assign(body, { examId });
        await this.partsService.create(combined);
        return {
            message: "Part created successfully"
        }
    }

    @Patch("/:partId")
    async updatePart(@Body() body: UpdatePartDto & BodyTokenPayload & { partId: string }, @Param("partId") partId: string) {
        const combined = Object.assign(body, { partId });
        await this.partsService.update(combined);
        return {
            message: "Part updated successfully"
        }
    }
}
