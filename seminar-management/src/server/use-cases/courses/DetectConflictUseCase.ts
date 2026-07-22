/**
 * Conflict Detection Use Case
 * Domain logic only — depends purely on ICourseRepository interface
 */
import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { ConflictResult } from '@server/domain/entities/ConflictResult';

export class DetectConflictUseCase {
    constructor(private readonly courseRepository: ICourseRepository) { }

    /**
     * Checks whether a trainer already has a course assigned
     * that overlaps with the proposed course date.
     *
     * Overlap logic:
     *   Two courses conflict if they share the same date OR
     *   if one course's endDate falls within the other's range.
     *   (Simple day-level detection; extend for hour-level if needed)
     */
    async execute(
        trainerId: string,
        proposedDate: Date,
        proposedEndDate?: Date,
        excludeCourseId?: string
    ): Promise<ConflictResult> {
        const courses = await this.courseRepository.findByTrainerId(trainerId);

        for (const course of courses) {
            if (excludeCourseId && course.id === excludeCourseId) continue;

            const courseStart = new Date(course.date);
            const courseEnd = course.endDate ? new Date(course.endDate) : new Date(course.date);

            const proposedStart = proposedDate;
            const proposedEnd = proposedEndDate ?? proposedDate;

            // Date-range overlap: A starts before B ends AND A ends after B starts
            const overlaps =
                proposedStart <= courseEnd && proposedEnd >= courseStart;

            if (overlaps) {
                return {
                    hasConflict: true,
                    conflictingCourseId: course.id,
                    conflictingCourseName: course.name,
                    reason: `Trainer is already assigned to "${course.name}" on ${courseStart.toLocaleDateString()}`,
                };
            }
        }

        return { hasConflict: false };
    }
}
