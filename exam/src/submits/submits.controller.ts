import { Body, Controller, Get, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { CreateSubmitDto, FinishSessionDto, SubmitAnswersDto } from 'src/dto/submit_module.dto';
import { BodyTokenPayload, TokenPayload } from 'src/interfaces/payload';
import type { Request } from 'express';

@Controller("session")
export class SubmitsController {
    constructor(private readonly submitsService: SubmitsService) { }

    @Post('create/:examId')
    async createSession(@Body() body: CreateSubmitDto & BodyTokenPayload, @Param("examId") examId: string) {
        const data = await this.submitsService.createSession({ ...body, examId });
        return { data, message: "Session created successfully", status: HttpStatus.CREATED };
    }

    @Post('submit-answers/:sessionId')
    async submitAnswers(
        @Param('sessionId') sessionId: string,
        @Body() body: SubmitAnswersDto & BodyTokenPayload,
    ) {
        const data = await this.submitsService.submitAnswers({ ...body, sessionId });
        return { data, message: "Answers submitted successfully", status: HttpStatus.OK };
    }

    @Post('/finish/:sessionId')
    async finishSession(
        @Param('sessionId') sessionId: string,
        @Body() body: FinishSessionDto & BodyTokenPayload,
    ) {
        const data = await this.submitsService.finishSession({ ...body, sessionId });
        return { data, message: "Session finished successfully", status: HttpStatus.OK };
    }

    @Get(':sessionId')
    async findSession(
        @Param('sessionId') sessionId: string,
        @Req() req: Request & { payload: TokenPayload },
    ) {
        const data = await this.submitsService.findSessionById(sessionId, req.payload);
        return { data, message: "Session fetched successfully", status: HttpStatus.OK };
    }

    @Get('user/all')
    async findUserSessions(@Req() req: Request & { payload: TokenPayload }) {
        const data = await this.submitsService.findUserSessions(req.payload);
        return { data, message: "Sessions fetched successfully", status: HttpStatus.OK };
    }
}
