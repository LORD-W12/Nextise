import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';
import { Course } from '@server/domain/entities/Course';

export class GetCourseByIdUseCase {
    constructor(private readonly courseRepository: ICourseRepository) { }

    async execute(id: string): Promise<Course | null> {
        return this.courseRepository.findById(id);
    }
}
