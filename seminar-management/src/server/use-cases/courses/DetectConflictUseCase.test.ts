import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DetectConflictUseCase } from '@server/use-cases/courses/DetectConflictUseCase';
import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { Course } from '@server/domain/entities/Course';

describe('DetectConflictUseCase', () => {
    let mockCourseRepo: import('vitest').Mocked<ICourseRepository>;
    let useCase: DetectConflictUseCase;

    beforeEach(() => {
        mockCourseRepo = {
            findAll: vi.fn(),
            findById: vi.fn(),
            findByTrainerId: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as any;

        useCase = new DetectConflictUseCase(mockCourseRepo);
    });

    const createCourse = (id: string, date: string, endDate: string): Course => ({
        id,
        name: 'Test',
        date: new Date(date),
        endDate: new Date(endDate),
        subject: ['TS'],
        location: 'Remote',
        participants: 10,
        notes: '',
        price: 100,
        trainerPrice: 50,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    it('returns free status if trainer has no other courses', async () => {
        mockCourseRepo.findByTrainerId.mockResolvedValue([]);

        await expect(useCase.execute('trainer-1', new Date('2024-01-01'), new Date('2024-01-05'))).resolves.toEqual({
            hasConflict: false,
        });
    });

    it('detects a conflict when proposed dates overlap completely with an existing course', async () => {
        const existing = createCourse('c1', '2024-01-02T10:00:00Z', '2024-01-04T17:00:00Z');
        mockCourseRepo.findByTrainerId.mockResolvedValue([existing]);

        await expect(useCase.execute('trainer-1', new Date('2024-01-01T09:00:00Z'), new Date('2024-01-05T18:00:00Z'))).resolves.toEqual({
            hasConflict: true,
            conflictingCourseId: 'c1',
            conflictingCourseName: 'Test',
            reason: expect.any(String),
        });
    });

    it('detects a conflict when proposed end date overlaps partially into an existing course', async () => {
        const existing = createCourse('c1', '2024-01-10T10:00:00Z', '2024-01-12T17:00:00Z');
        mockCourseRepo.findByTrainerId.mockResolvedValue([existing]);

        await expect(useCase.execute('trainer-1', new Date('2024-01-08T09:00:00Z'), new Date('2024-01-10T12:00:00Z'))).resolves.toEqual({
            hasConflict: true,
            conflictingCourseId: 'c1',
            conflictingCourseName: 'Test',
            reason: expect.any(String),
        });
    });

    it('allows scheduling if proposed dates are strictly before the existing course', async () => {
        const existing = createCourse('c1', '2024-01-10T10:00:00Z', '2024-01-12T17:00:00Z');
        mockCourseRepo.findByTrainerId.mockResolvedValue([existing]);

        await expect(useCase.execute('trainer-1', new Date('2024-01-08T09:00:00Z'), new Date('2024-01-10T09:30:00Z'))).resolves.toEqual({
            hasConflict: false,
        });
    });
});
