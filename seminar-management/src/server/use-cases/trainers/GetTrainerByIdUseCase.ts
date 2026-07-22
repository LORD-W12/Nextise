import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { Trainer } from '@server/domain/entities/Trainer';

export class GetTrainerByIdUseCase {
    constructor(private readonly trainerRepository: ITrainerRepository) { }

    async execute(id: string): Promise<Trainer | null> {
        return this.trainerRepository.findById(id);
    }
}
