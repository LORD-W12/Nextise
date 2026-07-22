import { Trainer } from '../entities/Trainer';

// Repository contract – only pure TypeScript, no implementation details
export interface ITrainerRepository {
    findAll(): Promise<Trainer[]>;
    findById(id: string): Promise<Trainer | null>;
    create(trainer: Omit<Trainer, 'id'>): Promise<Trainer>;
    update(id: string, trainer: Partial<Omit<Trainer, 'id'>>): Promise<Trainer>;
    delete(id: string): Promise<void>;
}
