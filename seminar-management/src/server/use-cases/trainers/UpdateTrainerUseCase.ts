import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { Trainer } from '@server/domain/entities/Trainer';

export class UpdateTrainerUseCase {
    constructor(private readonly trainerRepository: ITrainerRepository) { }

    async execute(id: string, data: Partial<Omit<Trainer, 'id'>>): Promise<Trainer> {
        return this.trainerRepository.update(id, data);
    }
}
