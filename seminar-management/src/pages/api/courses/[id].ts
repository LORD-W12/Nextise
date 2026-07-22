import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { PrismaCourseRepository } from '@server/infrastructure/database/repositories/PrismaCourseRepository';
import { GetCourseByIdUseCase } from '@server/use-cases/courses/GetCourseByIdUseCase';
import { UpdateCourseUseCase } from '@server/use-cases/courses/UpdateCourseUseCase';
import { DeleteCourseUseCase } from '@server/use-cases/courses/DeleteCourseUseCase';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, _user: AuthPayload) {
    const { id } = req.query as { id: string };
    const repository = new PrismaCourseRepository(prisma);

    try {
        if (req.method === 'GET') {
            const useCase = new GetCourseByIdUseCase(repository);
            const course = await useCase.execute(id);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            return res.status(200).json(course);
        }

        if (req.method === 'PUT') {
            const useCase = new UpdateCourseUseCase(repository);
            const body = req.body;
            const data = { ...body };
            if (body.date) data.date = new Date(body.date);
            if (body.endDate) data.endDate = new Date(body.endDate);
            if (body.participants !== undefined) data.participants = Number(body.participants);
            if (body.price !== undefined) data.price = Number(body.price);
            if (body.trainerPrice !== undefined) data.trainerPrice = Number(body.trainerPrice);
            if (body.subject !== undefined && !Array.isArray(body.subject)) data.subject = [body.subject];

            const updated = await useCase.execute(id, data);
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            const useCase = new DeleteCourseUseCase(repository);
            await useCase.execute(id);
            return res.status(200).json({ message: 'Course deleted successfully' });
        }

        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    } catch (error) {
        console.error(`[/api/courses/${id}]`, error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default requireAuth(handler);
