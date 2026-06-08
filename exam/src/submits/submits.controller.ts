import { Body, Controller, Param, Post } from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { CreateSubmitDto, FinishSessionDto, SubmitAnswersDto } from 'src/dto/submit_module.dto';
import { BodyTokenPayload } from 'src/interfaces/payload';

@Controller("session")
export class SubmitsController {
    constructor(private readonly submitsService: SubmitsService) { }

    @Post('create/:examId')
    async createSession(@Body() body: CreateSubmitDto & BodyTokenPayload, @Param("examId") examId: string) {
        return this.submitsService.createSession({ ...body, examId });
    }

    @Post('submit-answers/:sessionId')
    async submitAnswers(
        @Param('sessionId') sessionId: string,
        @Body() body: SubmitAnswersDto & BodyTokenPayload,
    ) {
        return this.submitsService.submitAnswers({ ...body, sessionId });
    }

    @Post('/finish/:sessionId')
    async finishSession(
        @Param('sessionId') sessionId: string,
        @Body() body: FinishSessionDto & BodyTokenPayload,
    ) {
        return this.submitsService.finishSession({ ...body, sessionId });
    }
}
