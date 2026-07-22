import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { PrismaTrainerRepository } from '@server/infrastructure/database/repositories/PrismaTrainerRepository';
import { GetTrainerByIdUseCase } from '@server/use-cases/trainers/GetTrainerByIdUseCase';
import { UpdateTrainerUseCase } from '@server/use-cases/trainers/UpdateTrainerUseCase';
import { DeleteTrainerUseCase } from '@server/use-cases/trainers/DeleteTrainerUseCase';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, _user: AuthPayload) {
    const { id } = req.query as { id: string };
    const repository = new PrismaTrainerRepository(prisma);

    try {
        if (req.method === 'GET') {
            const useCase = new GetTrainerByIdUseCase(repository);
            const trainer = await useCase.execute(id);
            if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
            return res.status(200).json(trainer);
        }

        if (req.method === 'PUT') {
            const useCase = new UpdateTrainerUseCase(repository);
            const body = req.body;
            const data = { ...body };
            if (body.hourlyRate !== undefined) data.hourlyRate = Number(body.hourlyRate);
            if (body.rating !== undefined) data.rating = Number(body.rating);
            if (body.subjects !== undefined && !Array.isArray(body.subjects)) data.subjects = [body.subjects];

            const updated = await useCase.execute(id, data);
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            const useCase = new DeleteTrainerUseCase(repository);
            await useCase.execute(id);
            return res.status(200).json({ message: 'Trainer deleted successfully' });
        }

        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    } catch (error) {
        console.error(`[/api/trainers/${id}]`, error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default requireAuth(handler);
