import { Body, Controller, Patch, Post } from "@nestjs/common";
import { PartsService } from "./parts.service";
import { CreatePartDto, UpdatePartDto } from "src/dto/part_module.dto";
import type { BodyTokenPayload } from "src/interfaces/payload";

@Controller()
export class PartsController {
    constructor(private readonly partsService: PartsService) { }
    @Post("/:examId")
    async createPart(@Body() body: CreatePartDto & BodyTokenPayload, @Prams() params: { examId: string }) {
        const combined = Object.assign(body, params);
        await this.partsService.create(combined);
        return {
            message: "Part created successfully"
        }
    }

    @Patch("/:partId")
    async updatePart(@Body() body: UpdatePartDto & BodyTokenPayload & { partId: string }) {
        await this.partsService.update(body);
        return {
            message: "Part updated successfully"
        }
    }
}

function Prams(): (target: PartsController, propertyKey: "createPart", parameterIndex: 1) => void {
    throw new Error("Function not implemented.");
}
