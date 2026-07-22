import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { Trainer } from '@server/domain/entities/Trainer';

export class CreateTrainerUseCase {
    constructor(private readonly trainerRepository: ITrainerRepository) { }

    async execute(data: Omit<Trainer, 'id'>): Promise<Trainer> {
        return this.trainerRepository.create(data);
    }
}
