import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssignTrainerUseCase } from '@server/use-cases/courses/AssignTrainerUseCase';
import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { IEmailService } from '@server/domain/services/IEmailService';
import { DetectConflictUseCase } from '@server/use-cases/courses/DetectConflictUseCase';

describe('AssignTrainerUseCase', () => {
    let mockCourseRepo: import('vitest').Mocked<ICourseRepository>;
    let mockTrainerRepo: import('vitest').Mocked<ITrainerRepository>;
    let mockEmailService: import('vitest').Mocked<IEmailService>;
    let mockDetectConflict: import('vitest').Mocked<DetectConflictUseCase>;
    let useCase: AssignTrainerUseCase;

    beforeEach(() => {
        mockCourseRepo = {
            findById: vi.fn(),
            update: vi.fn(),
            findByTrainerId: vi.fn(),
        } as any;

        mockTrainerRepo = {
            findById: vi.fn(),
        } as any;

        mockEmailService = {
            sendNotification: vi.fn(),
        } as any;

        mockEmailService = {
            send: vi.fn().mockResolvedValue(true),
        } as any;

        useCase = new AssignTrainerUseCase(
            mockCourseRepo,
            mockEmailService
        );
    });

    it('throws error if course is not found', async () => {
        mockCourseRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('c1', 't1', 'test@test.com', 'Test')).rejects.toThrow('Course not found');
    });



    it('throws error if there is a conflict', async () => {
        const dummyCourse = { id: 'c1', name: 'Course 1', date: new Date(), endDate: new Date() } as any;
        mockCourseRepo.findById.mockResolvedValue(dummyCourse);

        mockCourseRepo.findByTrainerId.mockResolvedValue([
            { id: 'c2', name: 'Existing', date: dummyCourse.date, endDate: dummyCourse.endDate } as any
        ]);

        await expect(useCase.execute('c1', 't1', 't@t.com', 'T1')).rejects.toThrow('already assigned');
    });

    it('successfully assigns the trainer and sends an email', async () => {
        const dummyCourse = { id: 'c1', name: 'Course 1', date: new Date(), endDate: new Date() } as any;
        mockCourseRepo.findById.mockResolvedValue(dummyCourse);
        mockCourseRepo.findByTrainerId.mockResolvedValue([]);

        mockCourseRepo.update.mockResolvedValue({ ...dummyCourse, trainerId: 't1' });

        const result = await useCase.execute('c1', 't1', 'trainer@example.com', 'T1');

        expect(mockCourseRepo.update).toHaveBeenCalledWith('c1', { trainerId: 't1' });
        expect(mockEmailService.send).toHaveBeenCalled();
        expect(result.trainerId).toBe('t1');
    });
});
