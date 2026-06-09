import { Test, TestingModule } from '@nestjs/testing';
import { ExamController } from './exams.controller';
import { ExamService } from './exams.service';

describe('ExamController', () => {
  let controller: ExamController;
  let service: jest.Mocked<Pick<ExamService, 'create'>>;

  const mockService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [{ provide: ExamService, useValue: mockService }],
    }).compile();

    controller = module.get<ExamController>(ExamController);
    service = module.get(ExamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to ExamService.create() with the full body', async () => {
    const body = {
      name: 'Math',
      description: 'desc',
      durationMinutes: 60,
      totalScore: 100,
      visibility: 'public',
      userId: 'some-user',
      thumbnailUrl: '',
      examTypeId: 'type-id',
      isPublished: true,
      payload: { accountId: 'acc-1', userId: 'user-1' },
    };
    const expected = { id: 'exam-1', ...body };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.createExam(body);

    expect(service.create).toHaveBeenCalledWith(body);
    expect(result).toEqual(expected);
  });

  it('returns whatever ExamService.create() returns', async () => {
    mockService.create.mockResolvedValue({ id: 'exam-2' });

    const result = await controller.createExam({
      name: 'x',
      description: 'x',
      durationMinutes: 1,
      totalScore: 1,
      visibility: 'x',
      userId: 'x',
      thumbnailUrl: '',
      examTypeId: 'x',
      isPublished: false,
      payload: { accountId: 'a', userId: 'u' },
    });

    expect(result).toEqual({ id: 'exam-2' });
  });
});
