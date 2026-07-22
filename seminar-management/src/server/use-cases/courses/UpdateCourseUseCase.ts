import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { Course } from '@server/domain/entities/Course';

export class UpdateCourseUseCase {
    constructor(private readonly courseRepository: ICourseRepository) { }

    async execute(id: string, data: Partial<Omit<Course, 'id' | 'trainer'>>): Promise<Course> {
        return this.courseRepository.update(id, data);
    }
}
