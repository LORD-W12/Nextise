/**
 * AI Trainer Matching Use Case
 * Depends on IAIService and ITrainerRepository domain interfaces only.
 */
import { ITrainerRepository } from '@server/domain/repositories/ITrainerRepository';
import { IAIService } from '@server/domain/services/IAIService';
import { Course } from '@server/domain/entities/Course';
import { TrainerMatchResult } from '@server/domain/entities/ConflictResult';

export class SuggestTrainersUseCase {
    constructor(
        private readonly trainerRepository: ITrainerRepository,
        private readonly aiService: IAIService
    ) { }

    async execute(course: Course): Promise<TrainerMatchResult[]> {
        const allTrainers = await this.trainerRepository.findAll();

        if (allTrainers.length === 0) {
            return [];
        }

        // Delegate to the AI service for intelligent ranking
        const suggestions = await this.aiService.suggestBestTrainer(course, allTrainers);

        // Return top 3 high-scoring suggestions (sorted by score descending)
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }
}
