import { ICourseRepository } from '@server/domain/repositories/ICourseRepository';

export class DeleteCourseUseCase {
    constructor(private readonly courseRepository: ICourseRepository) { }

    async execute(id: string): Promise<void> {
        await this.courseRepository.delete(id);
    }
}
