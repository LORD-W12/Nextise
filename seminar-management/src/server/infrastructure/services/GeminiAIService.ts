/**
 * Infrastructure: Google Gemini AI Service
 * Implements IAIService using Gemini 1.5 Flash for intelligent trainer matching
 *
 * Agentic Engineering Note:
 * - Single-turn prompt design for deterministic, cost-efficient calls
 * - Structured JSON output extracted with regex for reliability
 * - Graceful fallback to heuristic scoring when the API is unavailable
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIService } from '@server/domain/services/IAIService';
import { Course } from '@server/domain/entities/Course';
import { Trainer } from '@server/domain/entities/Trainer';
import { TrainerMatchResult } from '@server/domain/entities/ConflictResult';

export class GeminiAIService implements IAIService {
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
    }

    async suggestBestTrainer(
        course: Course,
        availableTrainers: Trainer[]
    ): Promise<TrainerMatchResult[]> {
        // Fallback: if no API key, use pure heuristic matching
        if (!this.genAI) {
            return this.heuristicMatch(course, availableTrainers);
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `
You are an expert seminar coordinator. Rank the following trainers for a course based on suitability.

COURSE:
- Name: ${course.name}
- Subject: ${course.subject}
- Location: ${course.location}
- Date: ${new Date(course.date).toLocaleDateString()}
- Participants: ${course.participants}
- Notes: ${course.notes}

TRAINERS:
${availableTrainers.map((t, i) => `${i + 1}. ID: ${t.id}, Name: ${t.name}, Subjects: [${t.subjects.join(', ')}], Location: ${t.location}, Email: ${t.email}`).join('\n')}

Return a JSON array (only valid JSON, no markdown) with all trainers ranked by suitability score (0-100):
[{"trainerId":"...","trainerName":"...","trainerEmail":"...","score":95,"reasoning":"...","subjectMatch":true,"locationMatch":false}]
`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('No JSON found in AI response');

            const parsed = JSON.parse(jsonMatch[0]) as TrainerMatchResult[];
            return parsed;
        } catch (error) {
            console.error('[GeminiAIService] Falling back to heuristic match:', error);
            return this.heuristicMatch(course, availableTrainers);
        }
    }

    /**
     * Heuristic fallback: Score trainers based on subject and location match
     * No external dependencies — always works even without an API key
     */
    private heuristicMatch(course: Course, trainers: Trainer[]): TrainerMatchResult[] {
        return trainers.map((trainer) => {
            const courseSubjectStr = course.subject.join(' ').toLowerCase();
            const trainerSubjStr = trainer.subjects.join(' ').toLowerCase();
            const subjectMatch = trainerSubjStr.includes(courseSubjectStr) || courseSubjectStr.includes(trainerSubjStr);
            const locationMatch = course.location.toLowerCase() === trainer.location.toLowerCase() || trainer.location.toLowerCase() === 'remote';

            const score = (subjectMatch ? 60 : 10) + (locationMatch ? 40 : 0);

            return {
                trainerId: trainer.id,
                trainerName: trainer.name,
                trainerEmail: trainer.email,
                score,
                reasoning: [
                    subjectMatch ? `Subject match: ${trainer.subjects.join(', ')}` : 'Subject mismatch',
                    locationMatch ? `Location match: ${trainer.location}` : `Different location (${trainer.location} vs ${course.location})`,
                ].join('. '),
                subjectMatch,
                locationMatch,
            };
        });
    }
}
