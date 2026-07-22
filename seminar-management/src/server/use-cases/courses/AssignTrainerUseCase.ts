/**
 * Assign Trainer to Course Use Case
 * Handles assignment + conflict check + email notification
 */
import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { IEmailService } from '@server/domain/services/IEmailService';
import { DetectConflictUseCase } from './DetectConflictUseCase';
import { Course } from '@server/domain/entities/Course';

export class AssignTrainerUseCase {
    constructor(
        private readonly courseRepository: ICourseRepository,
        private readonly emailService: IEmailService
    ) { }

    async execute(courseId: string, trainerId: string, trainerEmail: string, trainerName: string): Promise<Course> {
        // 1. Fetch the course
        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new Error('Course not found');

        // 2. Conflict detection before assignment
        const conflictDetector = new DetectConflictUseCase(this.courseRepository);
        const conflict = await conflictDetector.execute(
            trainerId,
            course.date,
            course.endDate,
            courseId
        );

        if (conflict.hasConflict) {
            throw new Error(conflict.reason ?? 'Scheduling conflict detected');
        }

        // 3. Perform the assignment
        const updated = await this.courseRepository.update(courseId, { trainerId });

        // 4. Send email notification (fire-and-forget, non-blocking)
        this.emailService
            .send({
                to: trainerEmail,
                subject: `Course Assignment: ${course.name}`,
                html: `
                    <div style="font-family:sans-serif;padding:20px;">
                        <h2 style="color:#1e40af;">New Course Assignment</h2>
                        <p>Dear ${trainerName},</p>
                        <p>You have been assigned to teach the following course:</p>
                        <table style="border-collapse:collapse;width:100%;">
                            <tr><td style="padding:8px;font-weight:bold;">Course</td><td style="padding:8px;">${course.name}</td></tr>
                            <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;">Subject</td><td style="padding:8px;">${course.subject}</td></tr>
                            <tr><td style="padding:8px;font-weight:bold;">Date</td><td style="padding:8px;">${new Date(course.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                            <tr style="background:#f8f9fa;"><td style="padding:8px;font-weight:bold;">Location</td><td style="padding:8px;">${course.location}</td></tr>
                            <tr><td style="padding:8px;font-weight:bold;">Participants</td><td style="padding:8px;">${course.participants}</td></tr>
                        </table>
                        <p style="margin-top:20px;">Please log into the Kodschul Management Hub to view more details.</p>
                        <p style="color:#6b7280;">Kodschul Management Hub — Automated Notification</p>
                    </div>
                `,
            })
            .catch((err: Error) => console.error('[AssignTrainer] Email notification failed:', err));

        return updated;
    }
}
