import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Submit } from 'src/entities/submits.entity';
import { Exam } from 'src/entities/exams.entity';
import { UserAnswer } from 'src/entities/user-answers.entity';
import { Part } from 'src/entities/parts.entity';
import { Question } from 'src/entities/questions.entity';
import { QuestionTopic } from 'src/entities/question-topic.entity';
import { Topic } from 'src/entities/topic.entity';
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
        @InjectRepository(QuestionTopic) private readonly questionTopicRepository: Repository<QuestionTopic>,
        @InjectRepository(Topic) private readonly topicRepository: Repository<Topic>,
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
            relations: { exam: true, userAnswers: { question: true } },
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

        const examQuestionCount = await this.countExamQuestions(submit.exam.id);

        let totalCorrect = 0;
        let totalScore = 0;
        const answeredCount = submit.userAnswers.length;

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

        const totalIncorrect = answeredCount - totalCorrect;
        const totalSkipped = examQuestionCount - answeredCount;
        const correctRatio = examQuestionCount > 0 ? totalCorrect / examQuestionCount : 0;
        const durationSeconds = Math.floor((Date.now() - submit.startedAt.getTime()) / 1000);

        submit.status = 'completed';
        submit.submittedAt = new Date();
        submit.totalCorrect = totalCorrect;
        submit.totalQuestions = examQuestionCount;
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
            totalIncorrect,
            totalSkipped,
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

        const answeredCount = submit.userAnswers?.length || 0;
        const correctCount = submit.totalCorrect;
        const totalQuestions = submit.totalQuestions || answeredCount;
        const incorrectCount = answeredCount - correctCount;
        const skippedCount = totalQuestions - answeredCount;
        const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;

        return {
            ...submit,
            result: `${correctCount}/${totalQuestions}`,
            accuracy,
            completionTime: submit.durationSeconds,
            correctCount,
            incorrectCount,
            skippedCount,
        };
    }

    async findUserSessions(payload: TokenPayload) {
        return await this.submitRepository.find({
            where: { userId: payload.userId, status: 'completed' },
            relations: { exam: true },
            order: { createdAt: "DESC" },
        });
    }

    private async countExamQuestions(examId: string): Promise<number> {
        const parts = await this.partRepository.find({
            where: { exam: { id: examId } },
        });
        const partIds = parts.map(p => p.id);
        if (partIds.length === 0) return 0;

        const [standaloneCount, groupCount] = await Promise.all([
            this.questionRepository.count({ where: { partId: In(partIds) } }),
            this.questionRepository.count({
                where: { questionGroup: { part: { id: In(partIds) } } },
            }),
        ]);
        return standaloneCount + groupCount;
    }

    async findSessionQuestions(sessionId: string, payload: TokenPayload) {
        const submit = await this.submitRepository.findOne({
            where: { id: sessionId, userId: payload.userId },
            relations: { exam: true },
        });
        if (!submit) {
            throw new NotFoundException('Session not found');
        }

        const parts = await this.partRepository.find({
            where: { exam: { id: submit.exam.id } },
        });
        const partIds = parts.map(p => p.id);
        if (partIds.length === 0) return [];

        const [standalone, groupQuestions] = await Promise.all([
            this.questionRepository.find({
                where: { partId: In(partIds) },
                select: { id: true, questionOrder: true, correctOption: true, sequence: true },
                order: { questionOrder: 'ASC' },
            }),
            this.questionRepository.find({
                where: { questionGroup: { part: { id: In(partIds) } } },
                select: { id: true, questionOrder: true, correctOption: true, sequence: true },
                order: { questionOrder: 'ASC' },
                relations: { questionGroup: true },
            }),
        ]);

        const allQuestions = [...standalone, ...groupQuestions].sort(
            (a, b) => a.sequence - b.sequence,
        );

        const userAnswers = await this.userAnswerRepository.find({
            where: { submit: { id: sessionId } },
            relations: { question: true },
        });
        const answerMap = new Map(userAnswers.map(ua => [ua.question.id, ua]));

        return allQuestions.map(q => {
            const answer = answerMap.get(q.id);
            let isCorrect: boolean | null = null;
            if (answer) {
                isCorrect = answer.isCorrect ??
                    JSON.stringify(answer.selectedOption) === JSON.stringify(q.correctOption);
            }
            return {
                id: q.id,
                order: q.questionOrder,
                correct_option: q.correctOption,
                is_correct: isCorrect,
                sequence: q.sequence
            };
        });
    }

    async getTopicAnalysis(sessionId: string, payload: TokenPayload, partId?: string) {
        const submit = await this.submitRepository.findOne({
            where: { id: sessionId, userId: payload.userId },
            relations: {
                userAnswers: {
                    question: {
                        questionGroup: true,
                        questionTopics: { topic: true },
                    },
                },
            },
        });
        if (!submit) {
            throw new NotFoundException('Session not found');
        }

        let answers = submit.userAnswers || [];
        if (partId) {
            answers = answers.filter(a => {
                const q = a.question;
                return q.partId === partId || q.questionGroup?.partId === partId;
            });
        }

        type TopicEntry = {
            topicId: string | null;
            topicName: string;
            correct: number;
            incorrect: number;
            skipped: number;
            accuracy: number;
            questions: { id: string; sequence: number }[];
        };

        const topicMap = new Map<string, TopicEntry>();

        const untagged: TopicEntry = {
            topicId: null,
            topicName: 'Untagged',
            correct: 0,
            incorrect: 0,
            skipped: 0,
            accuracy: 0,
            questions: [],
        };

        for (const answer of answers) {
            const topics = answer.question.questionTopics || [];
            if (topics.length === 0) {
                untagged.questions.push({ id: answer.question.id, sequence: answer.question.sequence });
                if (answer.isCorrect === true) untagged.correct++;
                else if (answer.isCorrect === false) untagged.incorrect++;
                else untagged.skipped++;
                continue;
            }

            for (const qt of topics) {
                const topic = qt.topic;
                if (!topicMap.has(topic.id)) {
                    topicMap.set(topic.id, {
                        topicId: topic.id,
                        topicName: topic.name,
                        correct: 0,
                        incorrect: 0,
                        skipped: 0,
                        accuracy: 0,
                        questions: [],
                    });
                }
                const entry = topicMap.get(topic.id)!;
                entry.questions.push({ id: answer.question.id, sequence: answer.question.sequence });
                if (answer.isCorrect === true) entry.correct++;
                else if (answer.isCorrect === false) entry.incorrect++;
                else entry.skipped++;
            }
        }

        const result = [...topicMap.values()];

        if (untagged.questions.length > 0 && !partId) {
            const total = untagged.correct + untagged.incorrect + untagged.skipped;
            untagged.accuracy = total > 0 ? untagged.correct / total : 0;
            result.push(untagged);
        }

        for (const entry of result) {
            const total = entry.correct + entry.incorrect + entry.skipped;
            entry.accuracy = total > 0 ? entry.correct / total : 0;
        }

        if (!partId) {
            result.sort((a, b) => a.topicName.localeCompare(b.topicName));
        }

        return result;
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteInProgressSessions() {
        await this.submitRepository.delete({
            status: 'in_progress',
        });
    }
}
