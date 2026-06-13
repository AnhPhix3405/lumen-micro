import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Submit } from 'src/entities/submits.entity';
import { Exam } from 'src/entities/exams.entity';
import { UserAnswer } from 'src/entities/user-answers.entity';
import { Part } from 'src/entities/parts.entity';
import { Question } from 'src/entities/questions.entity';
import { BodyTokenPayload, TokenPayload } from 'src/interfaces/payload';
import { AnswerItemDto } from 'src/dto/submit_module.dto';

@Injectable()
export class SubmitsService {
    constructor(
        @InjectRepository(Submit) private readonly submitRepository: Repository<Submit>,
        @InjectRepository(Exam) private readonly examRepository: Repository<Exam>,
        @InjectRepository(UserAnswer) private readonly userAnswerRepository: Repository<UserAnswer>,
        @InjectRepository(Part) private readonly partRepository: Repository<Part>,
        @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    ) { }

    async createSession(params: { examId: string; timeLimit?: number } & BodyTokenPayload) {
        const exam = await this.examRepository.findOne({ where: { id: params.examId } });
        if (!exam) {
            throw new NotFoundException('Exam not found');
        }
        if (!exam.isPublished) {
            throw new BadRequestException('Exam is not published');
        }

        let timeLimitSeconds: number | null;
        if (params.timeLimit !== undefined && params.timeLimit !== null) {
            timeLimitSeconds = params.timeLimit;
        } else if (exam.durationMinutes) {
            timeLimitSeconds = exam.durationMinutes * 60;
        } else {
            timeLimitSeconds = null;
        }

        const submit = this.submitRepository.create({
            exam,
            userId: params.payload.userId,
            status: 'in_progress',
            timeLimitSeconds,
            startedAt: new Date(),
            metadata: { timeLimitSeconds },
        });

        const saved = await this.submitRepository.save(submit);

        return {
            sessionId: saved.id,
            startedAt: saved.startedAt,
            timeLimitSeconds: saved.timeLimitSeconds,
        };
    }

    async submitAnswers(params: { sessionId: string; answers: AnswerItemDto[] } & BodyTokenPayload) {
        const submit = await this.submitRepository.findOne({
            where: { id: params.sessionId, userId: params.payload.userId },
            relations: { exam: true },
        });

        if (!submit) {
            throw new NotFoundException('Submit not found');
        }

        if (submit.status !== 'in_progress') {
            throw new BadRequestException('Submit is not in progress');
        }

        const deduped = new Map<string, AnswerItemDto>();
        for (const item of params.answers) {
            deduped.set(item.questionId, item);
        }
        const uniqueAnswers = [...deduped.values()];
        const questionIds = uniqueAnswers.map(a => a.questionId);

        const examParts = await this.partRepository.find({
            where: { exam: { id: submit.exam.id } },
        });
        const validPartIds = new Set(examParts.map(p => p.id));

        const questions = await this.questionRepository.find({
            where: { id: In(questionIds) },
            relations: { questionGroup: { part: true } },
        });

        if (questions.length !== uniqueAnswers.length) {
            throw new BadRequestException('One or more questions not found');
        }

        const questionMap = new Map(questions.map(q => [q.id, q]));

        const resolved: { question: Question; item: AnswerItemDto }[] = [];
        for (const item of uniqueAnswers) {
            const question = questionMap.get(item.questionId);
            if (!question) {
                throw new BadRequestException(`Question ${item.questionId} not found`);
            }

            let qPartId = question.partId;
            if (!qPartId && question.questionGroup?.part?.id) {
                qPartId = question.questionGroup.part.id;
            }
            if (qPartId && !validPartIds.has(qPartId)) {
                throw new BadRequestException(`Question ${item.questionId} does not belong to this exam`);
            }

            resolved.push({ question, item });
        }

        const existing = await this.userAnswerRepository.find({
            where: { submit: { id: params.sessionId } },
            relations: { question: true },
        });
        const existingByQid = new Map(existing.map(ua => [ua.question.id, ua]));

        const toSave: UserAnswer[] = [];
        for (const { question, item } of resolved) {
            let ua = existingByQid.get(question.id);
            if (ua) {
                ua.selectedOption = item.selectedOption ?? null;
                ua.answerContent = item.answerContent ?? null;
                ua.audioUrl = item.audioUrl ?? null;
                ua.answerType = question.type;
                ua.answeredAt = new Date();
            } else {
                ua = new UserAnswer();
                ua.submit = submit;
                ua.question = question;
                ua.selectedOption = item.selectedOption ?? null;
                ua.answerContent = item.answerContent ?? null;
                ua.audioUrl = item.audioUrl ?? null;
                ua.answerType = question.type;
                ua.answeredAt = new Date();
            }
            toSave.push(ua);
        }

        const saved = await this.userAnswerRepository.save(toSave);

        return {
            sessionId: submit.id,
            answered: saved.length,
            answers: saved.map(a => ({
                questionId: a.question.id,
                answerId: a.id,
            })),
        };
    }

    async finishSession(params: { sessionId: string } & BodyTokenPayload) {
        const submit = await this.submitRepository.findOne({
            where: { id: params.sessionId },
            relations: { userAnswers: { question: true } },
        });

        if (!submit) {
            throw new NotFoundException('Submit not found');
        }

        if (submit.userId !== params.payload.userId) {
            throw new ForbiddenException('Access denied');
        }

        if (submit.status !== 'in_progress') {
            throw new BadRequestException('Submit is not in progress');
        }

        let totalCorrect = 0;
        let totalScore = 0;
        const totalQuestions = submit.userAnswers.length;

        for (const answer of submit.userAnswers) {
            const isCorrect = JSON.stringify(answer.selectedOption) === JSON.stringify(answer.question.correctOption);
            const score = isCorrect ? answer.question.score : 0;

            answer.isCorrect = isCorrect;
            answer.score = score;

            if (isCorrect) {
                totalCorrect++;
            }
            totalScore += score;
        }

        const correctRatio = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
        const durationSeconds = Math.floor((Date.now() - submit.startedAt.getTime()) / 1000);

        submit.status = 'completed';
        submit.submittedAt = new Date();
        submit.totalCorrect = totalCorrect;
        submit.totalQuestions = totalQuestions;
        submit.totalScore = totalScore;
        submit.correctRatio = correctRatio;
        submit.durationSeconds = durationSeconds;

        await this.submitRepository.save(submit);
        await this.userAnswerRepository.save(submit.userAnswers);

        return {
            sessionId: submit.id,
            status: submit.status,
            totalScore: submit.totalScore,
            totalCorrect: submit.totalCorrect,
            totalQuestions: submit.totalQuestions,
            correctRatio: submit.correctRatio,
            durationSeconds: submit.durationSeconds,
        };
    }

    async findSessionById(sessionId: string, payload: TokenPayload) {
        const submit = await this.submitRepository.findOne({
            where: { id: sessionId, userId: payload.userId },
            relations: {
                exam: { examType: true },
                userAnswers: { question: true },
            },
        });
        if (!submit) {
            throw new NotFoundException('Session not found');
        }
        return submit;
    }

    async findUserSessions(payload: TokenPayload) {
        console.log('findUserSessions');
        console.log(payload);
        return await this.submitRepository.find({
            where: { userId: payload.userId },
            relations: { exam: true },
            order: { createdAt: "DESC" },
        });
    }
}
