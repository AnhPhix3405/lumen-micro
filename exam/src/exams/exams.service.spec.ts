import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamService } from './exams.service';
import { Exam } from '../entities/exams.entity';
import { CreateExamDto } from '../dto/exam_module.dto';

describe('ExamService', () => {
  let service: ExamService;
  let repository: jest.Mocked<Pick<Repository<Exam>, 'create' | 'save'>>;

  const payload = { payload: { accountId: 'acc-1', userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: getRepositoryToken(Exam),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    repository = module.get(getRepositoryToken(Exam));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an exam with all fields, using userId from JWT payload', async () => {
    const dto: CreateExamDto = {
      name: 'Math Exam',
      description: 'Algebra test',
      durationMinutes: 90,
      totalScore: 100,
      visibility: 'public',
      userId: 'malicious-override', // must be ignored
      thumbnailUrl: 'https://example.com/thumb.png',
      examTypeId: 'type-uuid-1',
      isPublished: false,
    };

    const created = { id: 'exam-uuid-1', ...dto, userId: 'user-1' } as Exam;
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    const result = await service.create({ ...dto, ...payload });

    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: dto.name,
      description: dto.description,
      durationMinutes: dto.durationMinutes,
      totalScore: dto.totalScore,
      visibility: dto.visibility,
      thumbnailUrl: dto.thumbnailUrl,
      examTypeId: dto.examTypeId,
      isPublished: dto.isPublished,
    });
    expect(repository.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('works when optional thumbnailUrl is omitted', async () => {
    const dto: CreateExamDto = {
      name: 'Science Quiz',
      description: 'Physics basics',
      durationMinutes: 30,
      totalScore: 50,
      visibility: 'private',
      userId: 'ignored',
      thumbnailUrl: '',
      examTypeId: 'type-uuid-2',
      isPublished: true,
    };

    const created = { id: 'exam-uuid-2', ...dto, userId: 'user-1' } as Exam;
    repository.create.mockReturnValue(created);
    repository.save.mockResolvedValue(created);

    const result = await service.create({ ...dto, ...payload });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
    );
    expect(result).toEqual(created);
  });

  it('propagates database errors', async () => {
    const dto: CreateExamDto = {
      name: 'Error Exam',
      description: 'Should fail',
      durationMinutes: 10,
      totalScore: 10,
      visibility: 'private',
      userId: 'x',
      thumbnailUrl: '',
      examTypeId: 'type-uuid-3',
      isPublished: false,
    };

    repository.create.mockReturnValue({} as Exam);
    repository.save.mockRejectedValue(new Error('DB connection lost'));

    await expect(service.create({ ...dto, ...payload })).rejects.toThrow(
      'DB connection lost',
    );
  });
});
