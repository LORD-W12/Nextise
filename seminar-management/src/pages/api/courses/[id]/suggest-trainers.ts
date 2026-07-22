/**
 * GET /api/courses/[id]/suggest-trainers
 * Returns AI-ranked list of suitable trainers for a course
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { PrismaCourseRepository } from '@server/infrastructure/database/repositories/PrismaCourseRepository';
import { PrismaTrainerRepository } from '@server/infrastructure/database/repositories/PrismaTrainerRepository';
import { SuggestTrainersUseCase } from '@server/use-cases/trainers/SuggestTrainersUseCase';
import { GeminiAIService } from '@server/infrastructure/services/GeminiAIService';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, _user: AuthPayload) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query as { id: string };
    const courseRepository = new PrismaCourseRepository(prisma);
    const trainerRepository = new PrismaTrainerRepository(prisma);
    const aiService = new GeminiAIService();

    try {
        const course = await courseRepository.findById(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const useCase = new SuggestTrainersUseCase(trainerRepository, aiService);
        const suggestions = await useCase.execute(course);

        return res.status(200).json(suggestions);
    } catch (error) {
        const err = error as Error;
        console.error(`[/api/courses/${id}/suggest-trainers]`, err.message);
        return res.status(500).json({ error: 'Failed to generate trainer suggestions' });
    }
}

export default requireAuth(handler);
