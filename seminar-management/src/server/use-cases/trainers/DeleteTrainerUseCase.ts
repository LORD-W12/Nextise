import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';

export class DeleteTrainerUseCase {
    constructor(private readonly trainerRepository: ITrainerRepository) { }

    async execute(id: string): Promise<void> {
        await this.trainerRepository.delete(id);
    }
}
