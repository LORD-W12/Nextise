/**
 * POST /api/courses/[id]/assign   – Assign trainer with conflict detection + email
 * DELETE /api/courses/[id]/assign – Remove trainer from course
 *
 * Body: { trainerId: string }
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { PrismaCourseRepository } from '@server/infrastructure/database/repositories/PrismaCourseRepository';
import { PrismaTrainerRepository } from '@server/infrastructure/database/repositories/PrismaTrainerRepository';
import { AssignTrainerUseCase } from '@server/use-cases/courses/AssignTrainerUseCase';
import { NodemailerEmailService } from '@server/infrastructure/services/NodemailerEmailService';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, _user: AuthPayload) {
    const { id } = req.query as { id: string };
    const courseRepository = new PrismaCourseRepository(prisma);
    const trainerRepository = new PrismaTrainerRepository(prisma);
    const emailService = new NodemailerEmailService();

    try {
        if (req.method === 'POST') {
            const { trainerId } = req.body as { trainerId: string };

            if (!trainerId) {
                return res.status(400).json({ error: 'trainerId is required' });
            }

            // Fetch trainer details for email
            const trainer = await trainerRepository.findById(trainerId);
            if (!trainer) {
                return res.status(404).json({ error: 'Trainer not found' });
            }

            const useCase = new AssignTrainerUseCase(courseRepository, emailService);
            const updatedCourse = await useCase.execute(id, trainerId, trainer.email, trainer.name);

            return res.status(200).json(updatedCourse);
        }

        if (req.method === 'DELETE') {
            const updated = await courseRepository.update(id, { trainerId: undefined });
            return res.status(200).json(updated);
        }

        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    } catch (error) {
        const err = error as Error;
        console.error(`[/api/courses/${id}/assign]`, err.message);

        if (err.message.includes('conflict') || err.message.includes('Trainer is already')) {
            return res.status(409).json({ error: err.message });
        }

        return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
}

export default requireAuth(handler);
