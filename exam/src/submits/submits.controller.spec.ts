import { Test, TestingModule } from '@nestjs/testing';
import { SubmitsController } from './submits.controller';
import { SubmitsService } from './submits.service';

describe('SubmitsController', () => {
  let controller: SubmitsController;
  let service: jest.Mocked<
    Pick<SubmitsService, 'createSession' | 'submitAnswers' | 'finishSession'>
  >;

  const mockService = {
    createSession: jest.fn(),
    submitAnswers: jest.fn(),
    finishSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmitsController],
      providers: [{ provide: SubmitsService, useValue: mockService }],
    }).compile();

    controller = module.get<SubmitsController>(SubmitsController);
    service = module.get(SubmitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('delegates to service with { ...body, examId }', async () => {
      const body = { timeLimit: 1800, payload: { accountId: 'a', userId: 'u' } };
      const examId = 'exam-1';
      const expected = { sessionId: 's-1', startedAt: new Date(), timeLimitSeconds: 1800 };
      mockService.createSession.mockResolvedValue(expected);

      const result = await controller.createSession(body, examId);

      expect(service.createSession).toHaveBeenCalledWith({ ...body, examId });
      expect(result).toEqual(expected);
    });

    it('passes body without timeLimit when not provided', async () => {
      const body = { payload: { accountId: 'a', userId: 'u' } };
      const examId = 'exam-2';
      mockService.createSession.mockResolvedValue({} as any);

      await controller.createSession(body, examId);

      expect(service.createSession).toHaveBeenCalledWith({ ...body, examId });
    });
  });

  describe('finishSession', () => {
    it('delegates to service with { ...body, sessionId }', async () => {
      const body = { payload: { accountId: 'a', userId: 'u' } };
      const sessionId = 'session-1';
      const expected = {
        sessionId,
        status: 'completed',
        totalScore: 10,
        totalCorrect: 1,
        totalQuestions: 2,
        correctRatio: 0.5,
        durationSeconds: 60,
      };
      mockService.finishSession.mockResolvedValue(expected);

      const result = await controller.finishSession(sessionId, body);

      expect(service.finishSession).toHaveBeenCalledWith({ ...body, sessionId });
      expect(result).toEqual(expected);
    });
  });
});
