import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExamModule } from '../src/exams/exams.module';
import { PartsModule } from '../src/parts/parts.module';
import { QuestionGroupModule } from '../src/question_groups/question_groups.module';
import { QuestionsModule } from '../src/questions/questions.module';
import { Exam } from '../src/entities/exams.entity';
import { ExamType } from '../src/entities/exam-types.entity';
import { Part } from '../src/entities/parts.entity';
import { QuestionGroup } from '../src/entities/question-groups.entity';
import { Question } from '../src/entities/questions.entity';

describe('Exams (e2e) — create exam', () => {
  let app: INestApplication;
  let examTypeRepo: Repository<ExamType>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Exam, ExamType, Part, QuestionGroup, Question],
          synchronize: true,
        }),
        ExamModule,
        PartsModule,
        QuestionGroupModule,
        QuestionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    examTypeRepo = moduleFixture.get<Repository<ExamType>>(getRepositoryToken(ExamType));
    await examTypeRepo.save({ id: 'e2e-type-1', name: 'General', code: 'GEN' });
  });

  afterAll(async () => {
    await app.close();
  });

  const validPayload = {
    payload: { accountId: 'acc-1', userId: 'user-1' },
  };

  it('POST / creates an exam and returns 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/')
      .send({
        name: 'E2E Math Exam',
        description: 'End-to-end test exam',
        durationMinutes: 60,
        totalScore: 100,
        visibility: 'public',
        userId: 'hacker-id', // should be ignored
        thumbnailUrl: '',
        examTypeId: 'e2e-type-1',
        isPublished: true,
        ...validPayload,
      })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'E2E Math Exam',
      userId: 'user-1', // from JWT, not body
      examTypeId: 'e2e-type-1',
      isPublished: true,
    });
    expect(res.body.createdAt).toBeDefined();
  });

  it('POST / returns 400 when required fields are missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/')
      .send({
        name: '',
        description: '',
        durationMinutes: null,
        totalScore: null,
        visibility: '',
        userId: 'x',
        examTypeId: 'x',
        isPublished: null,
        ...validPayload,
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('POST / uses JWT userId even when a different userId is in the body', async () => {
    const res = await request(app.getHttpServer())
      .post('/')
      .send({
        name: 'Security Check Exam',
        description: 'Testing userId override',
        durationMinutes: 30,
        totalScore: 50,
        visibility: 'private',
        userId: 'malicious-attempt',
        thumbnailUrl: '',
        examTypeId: 'e2e-type-1',
        isPublished: false,
        ...validPayload,
      })
      .expect(201);

    expect(res.body.userId).toBe('user-1');
  });
});
