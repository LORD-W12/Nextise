import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { Course } from '@server/domain/entities/Course';

export class CreateCourseUseCase {
    constructor(private readonly courseRepository: ICourseRepository) { }

    async execute(data: Omit<Course, 'id' | 'trainer' | 'createdAt' | 'updatedAt'>): Promise<Course> {
        return this.courseRepository.create(data);
    }
}
