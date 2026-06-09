import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExamModule } from '../src/exams/exams.module';
import { SubmitsModule } from '../src/submits/submits.module';
import { PartsModule } from '../src/parts/parts.module';
import { QuestionGroupModule } from '../src/question_groups/question_groups.module';
import { QuestionsModule } from '../src/questions/questions.module';
import { Exam } from '../src/entities/exams.entity';
import { ExamType } from '../src/entities/exam-types.entity';
import { Part } from '../src/entities/parts.entity';
import { QuestionGroup } from '../src/entities/question-groups.entity';
import { Question } from '../src/entities/questions.entity';
import { Submit } from '../src/entities/submits.entity';
import { UserAnswer } from '../src/entities/user-answers.entity';

describe('Submits (e2e) — create session & finish session', () => {
  let app: INestApplication;
  let examRepo: Repository<Exam>;
  let examTypeRepo: Repository<ExamType>;
  let partRepo: Repository<Part>;
  let questionRepo: Repository<Question>;
  let submitRepo: Repository<Submit>;
  let userAnswerRepo: Repository<UserAnswer>;

  const userPayload = { payload: { accountId: 'acc-1', userId: 'user-1' } };
  const otherUserPayload = { payload: { accountId: 'acc-2', userId: 'user-2' } };

  // Seeded entities shared across tests
  let publishedExam: Exam;
  let unpublishedExam: Exam;
  let question1: Question;
  let question2: Question;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Exam, ExamType, Part, QuestionGroup, Question, Submit, UserAnswer],
          synchronize: true,
        }),
        ExamModule,
        SubmitsModule,
        PartsModule,
        QuestionGroupModule,
        QuestionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    examRepo = moduleFixture.get<Repository<Exam>>(getRepositoryToken(Exam));
    examTypeRepo = moduleFixture.get<Repository<ExamType>>(getRepositoryToken(ExamType));
    partRepo = moduleFixture.get<Repository<Part>>(getRepositoryToken(Part));
    questionRepo = moduleFixture.get<Repository<Question>>(getRepositoryToken(Question));
    submitRepo = moduleFixture.get<Repository<Submit>>(getRepositoryToken(Submit));
    userAnswerRepo = moduleFixture.get<Repository<UserAnswer>>(getRepositoryToken(UserAnswer));

    // Seed shared data
    const examType = await examTypeRepo.save({ id: 'st-type-1', name: 'Standard', code: 'STD' });

    publishedExam = await examRepo.save({
      name: 'E2E Published Exam',
      description: 'For session testing',
      durationMinutes: 60,
      totalScore: 100,
      visibility: 'public',
      userId: 'user-1',
      examTypeId: examType.id,
      isPublished: true,
    });

    unpublishedExam = await examRepo.save({
      name: 'Unpublished Exam',
      description: 'Not available',
      durationMinutes: 30,
      totalScore: 50,
      visibility: 'private',
      userId: 'user-1',
      examTypeId: examType.id,
      isPublished: false,
    });

    const part = await partRepo.save({
      examId: publishedExam.id,
      exam: publishedExam,
      name: 'Part 1',
      type: 'multiple_choice',
      partOrder: 1,
      score: 15,
    });

    // note: QuestionGroup is referenced but not used in the test path
    question1 = await questionRepo.save({
      partId: part.id,
      content: 'What is 2+2?',
      type: 'separate',
      options: { A: '3', B: '4', C: '5' },
      correctOption: { key: 'B' },
      score: 10,
      questionOrder: 1,
    });

    question2 = await questionRepo.save({
      partId: part.id,
      content: 'What is the capital of France?',
      type: 'separate',
      options: { A: 'London', B: 'Paris', C: 'Berlin' },
      correctOption: { key: 'B' },
      score: 5,
      questionOrder: 2,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------------------------------------------------------ //
  //  createSession
  // ------------------------------------------------------------------ //

  describe('POST /session/create/:examId', () => {
    it('returns 201 and creates a session for a published exam', async () => {
      const res = await request(app.getHttpServer())
        .post(`/session/create/${publishedExam.id}`)
        .send(userPayload)
        .expect(201);

      expect(res.body).toMatchObject({
        sessionId: expect.any(String),
        startedAt: expect.any(String),
        timeLimitSeconds: 3600, // 60 min * 60
      });
    });

    it('returns 201 with custom timeLimit override', async () => {
      const res = await request(app.getHttpServer())
        .post(`/session/create/${publishedExam.id}`)
        .send({ timeLimit: 1800, ...userPayload })
        .expect(201);

      expect(res.body.timeLimitSeconds).toBe(1800);
    });

    it('returns 404 when exam does not exist', async () => {
      await request(app.getHttpServer())
        .post('/session/create/non-existent-id')
        .send(userPayload)
        .expect(404);
    });

    it('returns 400 when exam is not published', async () => {
      await request(app.getHttpServer())
        .post(`/session/create/${unpublishedExam.id}`)
        .send(userPayload)
        .expect(400);
    });
  });

  // ------------------------------------------------------------------ //
  //  finishSession
  // ------------------------------------------------------------------ //

  describe('POST /session/finish/:sessionId', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a fresh session + answers for each test
      const session = await submitRepo.save({
        exam: publishedExam,
        userId: 'user-1',
        status: 'in_progress',
        timeLimitSeconds: 3600,
        startedAt: new Date(),
      });

      await userAnswerRepo.save([
        {
          submit: session,
          question: question1,
          selectedOption: { key: 'B' }, // correct
          answerType: 'separate',
          answeredAt: new Date(),
        },
        {
          submit: session,
          question: question2,
          selectedOption: { key: 'A' }, // wrong
          answerType: 'separate',
          answeredAt: new Date(),
        },
      ]);

      sessionId = session.id;
    });

    it('returns 200 and scoring summary', async () => {
      const res = await request(app.getHttpServer())
        .post(`/session/finish/${sessionId}`)
        .send(userPayload)
        .expect(200);

      expect(res.body).toMatchObject({
        sessionId,
        status: 'completed',
        totalCorrect: 1,
        totalQuestions: 2,
        totalScore: 10, // only q1 correct
        correctRatio: 0.5,
        durationSeconds: expect.any(Number),
      });
    });

    it('returns 403 for a different user', async () => {
      await request(app.getHttpServer())
        .post(`/session/finish/${sessionId}`)
        .send(otherUserPayload)
        .expect(403);
    });

    it('returns 400 if session is already completed', async () => {
      // First finish
      await request(app.getHttpServer())
        .post(`/session/finish/${sessionId}`)
        .send(userPayload)
        .expect(200);

      // Second finish
      await request(app.getHttpServer())
        .post(`/session/finish/${sessionId}`)
        .send(userPayload)
        .expect(400);
    });

    it('returns 404 for non-existent session', async () => {
      await request(app.getHttpServer())
        .post('/session/finish/non-existent-id')
        .send(userPayload)
        .expect(404);
    });
  });
});
