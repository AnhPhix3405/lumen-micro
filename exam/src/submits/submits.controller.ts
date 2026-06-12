import { Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { CreateSubmitDto, FinishSessionDto, SubmitAnswersDto } from 'src/dto/submit_module.dto';
import { BodyTokenPayload } from 'src/interfaces/payload';

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
}
