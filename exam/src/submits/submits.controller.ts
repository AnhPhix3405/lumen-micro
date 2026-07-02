import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { CreateSubmitDto, FinishSessionDto, SubmitAnswersDto } from 'src/dto/submit_module.dto';
import type { BodyTokenPayload, TokenPayload } from 'src/interfaces/payload';
import type { Request } from 'express';

function payloadFromHeaders(req: Request): TokenPayload {
    return {
        userId: req.headers["x-user-id"] as string,
        accountId: req.headers["x-account-id"] as string,
    };
}

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

    @Get('user/all')
    async findUserSessions(@Req() req: Request) {
        const data = await this.submitsService.findUserSessions(payloadFromHeaders(req));
        return { data, message: "Sessions fetched successfully", status: HttpStatus.OK };
    }

    @Get(':sessionId')
    async findSession(
        @Param('sessionId') sessionId: string,
        @Req() req: Request,
    ) {
        const data = await this.submitsService.findSessionById(sessionId, payloadFromHeaders(req));
        return { data, message: "Session fetched successfully", status: HttpStatus.OK };
    }

    @Get(':sessionId/topic-analysis')
    async topicAnalysis(
        @Param('sessionId') sessionId: string,
        @Query('partId') partId: string | undefined,
        @Req() req: Request,
    ) {
        const data = await this.submitsService.getTopicAnalysis(sessionId, payloadFromHeaders(req), partId);
        return { data, message: "Topic analysis fetched successfully", status: HttpStatus.OK };
    }
}
