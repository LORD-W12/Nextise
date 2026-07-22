import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { PrismaTrainerRepository } from '@server/infrastructure/database/repositories/PrismaTrainerRepository';
import { GetTrainersUseCase } from '@server/use-cases/trainers/GetTrainersUseCase';
import { CreateTrainerUseCase } from '@server/use-cases/trainers/CreateTrainerUseCase';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, _user: AuthPayload) {
    const repository = new PrismaTrainerRepository(prisma);

    try {
        if (req.method === 'GET') {
            const useCase = new GetTrainersUseCase(repository);
            const trainers = await useCase.execute();
            return res.status(200).json(trainers);
        }

        if (req.method === 'POST') {
            const useCase = new CreateTrainerUseCase(repository);
            const body = req.body;
            const data = {
                ...body,
                hourlyRate: body.hourlyRate ? Number(body.hourlyRate) : undefined,
                rating: body.rating ? Number(body.rating) : undefined,
                subjects: Array.isArray(body.subjects) ? body.subjects : [body.subjects],
            };
            const newTrainer = await useCase.execute(data);
            return res.status(201).json(newTrainer);
        }

        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    } catch (error) {
        console.error('[/api/trainers]', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default requireAuth(handler);
