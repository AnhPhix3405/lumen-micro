import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { Submit } from '../entities/submits.entity';
import { Exam } from '../entities/exams.entity';
import { UserAnswer } from '../entities/user-answers.entity';
import { Part } from '../entities/parts.entity';
import { Question } from '../entities/questions.entity';

type MockRepo<T> = jest.Mocked<Pick<Repository<T>, keyof Repository<T>>>;

describe('SubmitsService', () => {
  let service: SubmitsService;
  let submitRepo: MockRepo<Submit>;
  let examRepo: MockRepo<Exam>;
  let userAnswerRepo: MockRepo<UserAnswer>;

  const payload = { payload: { accountId: 'acc-1', userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmitsService,
        {
          provide: getRepositoryToken(Submit),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Exam),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserAnswer),
          useValue: { save: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Part),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Question),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SubmitsService>(SubmitsService);
    submitRepo = module.get(getRepositoryToken(Submit));
    examRepo = module.get(getRepositoryToken(Exam));
    userAnswerRepo = module.get(getRepositoryToken(UserAnswer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------------------------------ //
  //  createSession
  // ------------------------------------------------------------------ //

  describe('createSession', () => {
    const examId = 'exam-uuid-1';

    it('creates a session with time limit from exam duration', async () => {
      const exam = { id: examId, isPublished: true, durationMinutes: 60 } as Exam;
      examRepo.findOne.mockResolvedValue(exam);

      const saved = {
        id: 'session-uuid-1',
        exam,
        userId: 'user-1',
        status: 'in_progress',
        timeLimitSeconds: 3600,
        startedAt: new Date(),
        metadata: { timeLimitSeconds: 3600 },
      } as Submit;
      submitRepo.create.mockReturnValue(saved);
      submitRepo.save.mockResolvedValue(saved);

      const result = await service.createSession({ examId, ...payload });

      expect(examRepo.findOne).toHaveBeenCalledWith({ where: { id: examId } });
      expect(submitRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ timeLimitSeconds: 3600 }),
      );
      expect(result).toEqual({
        sessionId: saved.id,
        startedAt: saved.startedAt,
        timeLimitSeconds: 3600,
      });
    });

    it('uses custom timeLimit override', async () => {
      const exam = { id: examId, isPublished: true, durationMinutes: 60 } as Exam;
      examRepo.findOne.mockResolvedValue(exam);

      const saved = {
        id: 'session-uuid-2',
        timeLimitSeconds: 1800,
        startedAt: new Date(),
      } as Submit;
      submitRepo.create.mockReturnValue(saved);
      submitRepo.save.mockResolvedValue(saved);

      const result = await service.createSession({ examId, timeLimit: 1800, ...payload });

      expect(submitRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ timeLimitSeconds: 1800 }),
      );
      expect(result.timeLimitSeconds).toBe(1800);
    });

    it('sets null time limit when exam has no duration and no override', async () => {
      const exam = { id: examId, isPublished: true, durationMinutes: null } as unknown as Exam;
      examRepo.findOne.mockResolvedValue(exam);

      const saved = {
        id: 'session-uuid-3',
        timeLimitSeconds: null,
        startedAt: new Date(),
      } as Submit;
      submitRepo.create.mockReturnValue(saved);
      submitRepo.save.mockResolvedValue(saved);

      const result = await service.createSession({ examId, ...payload });

      expect(submitRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ timeLimitSeconds: null }),
      );
      expect(result.timeLimitSeconds).toBeNull();
    });

    it('accepts timeLimit = 0 as a valid override', async () => {
      const exam = { id: examId, isPublished: true, durationMinutes: 60 } as Exam;
      examRepo.findOne.mockResolvedValue(exam);

      const saved = {
        id: 'session-uuid-4',
        timeLimitSeconds: 0,
        startedAt: new Date(),
      } as Submit;
      submitRepo.create.mockReturnValue(saved);
      submitRepo.save.mockResolvedValue(saved);

      const result = await service.createSession({ examId, timeLimit: 0, ...payload });

      expect(submitRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ timeLimitSeconds: 0 }),
      );
      expect(result.timeLimitSeconds).toBe(0);
    });

    it('throws NotFoundException when exam does not exist', async () => {
      examRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createSession({ examId, ...payload }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when exam is not published', async () => {
      examRepo.findOne.mockResolvedValue({ id: examId, isPublished: false } as Exam);

      await expect(
        service.createSession({ examId, ...payload }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------------------------------------------------ //
  //  finishSession
  // ------------------------------------------------------------------ //

  describe('finishSession', () => {
    const sessionId = 'session-uuid-finish';
    const now = Date.now();
    let baseSubmit: Partial<Submit>;
    let baseUserAnswers: Partial<UserAnswer>[];
    let questions: Partial<Question>[];

    beforeEach(() => {
      questions = [
        { id: 'q-1', correctOption: { key: 'A' }, score: 10 },
        { id: 'q-2', correctOption: { key: 'B' }, score: 5 },
      ];

      baseUserAnswers = [
        {
          question: questions[0] as Question,
          selectedOption: null,
          isCorrect: null,
          score: 0,
        },
        {
          question: questions[1] as Question,
          selectedOption: null,
          isCorrect: null,
          score: 0,
        },
      ];

      baseSubmit = {
        id: sessionId,
        userId: 'user-1',
        status: 'in_progress',
        startedAt: new Date(now - 120_000), // 2 minutes ago
        userAnswers: baseUserAnswers as UserAnswer[],
        totalCorrect: 0,
        totalQuestions: 0,
        totalScore: 0,
        correctRatio: null,
        durationSeconds: null,
        submittedAt: null,
      };
    });

    function mockFindOne(submit: Partial<Submit>) {
      submitRepo.findOne.mockResolvedValue(submit as Submit);
    }

    it('marks correct scoring for mixed answers', async () => {
      baseUserAnswers[0].selectedOption = { key: 'A' }; // correct
      baseUserAnswers[1].selectedOption = { key: 'C' }; // wrong
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result.totalCorrect).toBe(1);
      expect(result.totalQuestions).toBe(2);
      expect(result.totalScore).toBe(10);
      expect(result.correctRatio).toBe(0.5);
      expect(result.status).toBe('completed');
      expect(baseUserAnswers[0].isCorrect).toBe(true);
      expect(baseUserAnswers[0].score).toBe(10);
      expect(baseUserAnswers[1].isCorrect).toBe(false);
      expect(baseUserAnswers[1].score).toBe(0);
    });

    it('marks all correct when every answer matches', async () => {
      baseUserAnswers[0].selectedOption = { key: 'A' };
      baseUserAnswers[1].selectedOption = { key: 'B' };
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result.totalCorrect).toBe(2);
      expect(result.totalScore).toBe(15);
      expect(result.correctRatio).toBe(1);
    });

    it('handles empty userAnswers', async () => {
      baseSubmit.userAnswers = [];
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result.totalCorrect).toBe(0);
      expect(result.totalQuestions).toBe(0);
      expect(result.totalScore).toBe(0);
      expect(result.correctRatio).toBe(0);
    });

    it('handles varying question scores', async () => {
      questions[0].score = 20;
      questions[1].score = 30;
      baseUserAnswers[0].selectedOption = { key: 'A' }; // correct → 20
      baseUserAnswers[1].selectedOption = { key: 'C' }; // wrong → 0
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result.totalCorrect).toBe(1);
      expect(result.totalScore).toBe(20);
    });

    it('computes durationSeconds from startedAt to now', async () => {
      baseUserAnswers[0].selectedOption = { key: 'A' };
      baseUserAnswers[1].selectedOption = { key: 'B' };
      baseSubmit.startedAt = new Date(now - 90_000); // 90 seconds ago
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result.durationSeconds).toBe(90);
    });

    it('fails for JSON key-ordering mismatch (potential bug)', async () => {
      baseUserAnswers[0].selectedOption = { a: 1, b: 2 };
      (questions[0] as any).correctOption = { b: 2, a: 1 };
      baseUserAnswers[0].selectedOption = { a: 1, b: 2 };
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      // JSON.stringify({a:1,b:2}) !== JSON.stringify({b:2,a:1})
      // This is a known bug — assertion documents current behaviour
      expect(result.totalCorrect).toBe(0);
    });

    it('throws NotFoundException when submit does not exist', async () => {
      submitRepo.findOne.mockResolvedValue(null);

      await expect(
        service.finishSession({ sessionId, ...payload }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when userId does not match', async () => {
      mockFindOne({ ...baseSubmit, userId: 'other-user' });

      await expect(
        service.finishSession({ sessionId, ...payload }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when status is not in_progress', async () => {
      mockFindOne({ ...baseSubmit, status: 'completed' });

      await expect(
        service.finishSession({ sessionId, ...payload }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for any non-in_progress status', async () => {
      mockFindOne({ ...baseSubmit, status: 'reviewing' });

      await expect(
        service.finishSession({ sessionId, ...payload }),
      ).rejects.toThrow(BadRequestException);
    });

    it('persists the submit and userAnswers after finishing', async () => {
      baseUserAnswers[0].selectedOption = { key: 'A' };
      baseUserAnswers[1].selectedOption = { key: 'C' };
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      await service.finishSession({ sessionId, ...payload });

      expect(submitRepo.save).toHaveBeenCalled();
      expect(userAnswerRepo.save).toHaveBeenCalled();
    });

    it('sets submittedAt timestamp', async () => {
      baseUserAnswers[0].selectedOption = { key: 'A' };
      baseUserAnswers[1].selectedOption = { key: 'B' };
      mockFindOne(baseSubmit);

      submitRepo.save.mockImplementation(async (s: any) => s);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result.status).toBe('completed');
      expect(baseSubmit.submittedAt).toBeInstanceOf(Date);
    });

    it('returns the correct response shape', async () => {
      baseUserAnswers[0].selectedOption = { key: 'A' };
      baseUserAnswers[1].selectedOption = { key: 'B' };
      mockFindOne(baseSubmit);

      submitRepo.save.mockResolvedValue(baseSubmit as Submit);
      userAnswerRepo.save.mockResolvedValue([]);

      const result = await service.finishSession({ sessionId, ...payload });

      expect(result).toMatchObject({
        sessionId: expect.any(String),
        status: 'completed',
        totalScore: expect.any(Number),
        totalCorrect: expect.any(Number),
        totalQuestions: expect.any(Number),
        correctRatio: expect.any(Number),
        durationSeconds: expect.any(Number),
      });
    });
  });
});
