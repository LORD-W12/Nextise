// Frontend-facing types mirroring the domain shapes.
// Components & hooks MUST import from here, never from @server/domain.

export interface Trainer {
    id: string;
    name: string;
    subjects: string[];
    location: string;
    email: string;
    availability?: string;
    hourlyRate?: number;
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type CourseStatus = 'draft' | 'scheduled' | 'completed' | 'cancelled';

export interface Course {
    id: string;
    name: string;
    date: string; // ISO string
    endDate?: string; // ISO string
    subject: string[];
    location: string;
    participants: number;
    notes: string;
    price: number;
    trainerPrice: number;
    status: CourseStatus;
    trainerId?: string;
    trainer?: Trainer | null;
    createdAt?: string;
    updatedAt?: string;
}
