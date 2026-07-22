import { Course } from '../entities/Course';

// Repository contract – only pure TypeScript, no implementation details
export interface ICourseRepository {
    findAll(): Promise<Course[]>;
    findById(id: string): Promise<Course | null>;
    findByTrainerId(trainerId: string): Promise<Course[]>;
    create(course: Omit<Course, 'id' | 'trainer'>): Promise<Course>;
    update(id: string, course: Partial<Omit<Course, 'id' | 'trainer'>>): Promise<Course>;
    delete(id: string): Promise<void>;
}
