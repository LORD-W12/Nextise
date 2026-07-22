import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { Trainer } from '@server/domain/entities/Trainer';

export class GetTrainersUseCase {
    constructor(private readonly trainerRepository: ITrainerRepository) { }

    async execute(): Promise<Trainer[]> {
        return this.trainerRepository.findAll();
    }
}
