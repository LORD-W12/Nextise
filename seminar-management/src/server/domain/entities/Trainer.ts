// Pure domain entity - no ORM, no Next.js, no external libraries
export interface Trainer {
    id: string;
    name: string;
    subjects: string[];
    location: string;
    email: string;
    availability?: string; // JSON-serialized array of date ranges or blackout dates
    hourlyRate?: number;
    rating?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
