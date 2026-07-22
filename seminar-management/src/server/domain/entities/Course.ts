// Pure domain entity - no ORM, no Next.js, no external libraries
import { Trainer } from './Trainer';

export type CourseStatus = 'draft' | 'scheduled' | 'completed' | 'cancelled';

export interface Course {
    id: string;
    name: string;
    date: Date;
    endDate?: Date;
    subject: string[]; // array of strings
    location: string;
    participants: number;
    notes: string;
    price: number;
    trainerPrice: number;
    status: CourseStatus;
    trainerId?: string;
    trainer?: Trainer;
    createdAt?: Date;
    updatedAt?: Date;
}
