import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { Course } from '@server/domain/entities/Course';

export class GetCoursesUseCase {
    constructor(private readonly courseRepository: ICourseRepository) { }

    async execute(): Promise<Course[]> {
        return this.courseRepository.findAll();
    }
}
