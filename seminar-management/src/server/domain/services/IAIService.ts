// External AI service contract - pure TypeScript interface
import { Trainer } from '../entities/Trainer';
import { Course } from '../entities/Course';
import { TrainerMatchResult } from '../entities/ConflictResult';

export interface IAIService {
    suggestBestTrainer(course: Course, availableTrainers: Trainer[]): Promise<TrainerMatchResult[]>;
}
