import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "./guards/jwt_auth.guard";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import { TokenPayload } from "./interfaces/payload";
@Controller("exam")
export class ExamController {
    constructor(private readonly config: ConfigService) { }
    @Post()
    @UseGuards(JwtAuthGuard)
    async createExam(@Body() body: any, @Req() req: Request & { payload: TokenPayload }) {
        Object.assign(body, req.payload);
        const result = axios.post(`${this.config.get("EXAM_SERVICE_URL")}`, body);
        return (await result).data;
    }
}