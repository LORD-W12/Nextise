// Pure domain entity for conflict detection results
export interface ConflictResult {
    hasConflict: boolean;
    conflictingCourseId?: string;
    conflictingCourseName?: string;
    reason?: string;
}

export interface TrainerMatchResult {
    trainerId: string;
    trainerName: string;
    trainerEmail: string;
    score: number;
    reasoning: string;
    subjectMatch: boolean;
    locationMatch: boolean;
}
