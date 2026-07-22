import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { PrismaCourseRepository } from '@server/infrastructure/database/repositories/PrismaCourseRepository';
import { GetCoursesUseCase } from '@server/use-cases/courses/GetCoursesUseCase';
import { CreateCourseUseCase } from '@server/use-cases/courses/CreateCourseUseCase';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, _user: AuthPayload) {
    const repository = new PrismaCourseRepository(prisma);

    try {
        if (req.method === 'GET') {
            const useCase = new GetCoursesUseCase(repository);
            const courses = await useCase.execute();
            return res.status(200).json(courses);
        }

        if (req.method === 'POST') {
            const useCase = new CreateCourseUseCase(repository);
            const body = req.body;
            const data = {
                ...body,
                date: new Date(body.date),
                endDate: body.endDate ? new Date(body.endDate) : undefined,
                participants: Number(body.participants),
                price: Number(body.price),
                trainerPrice: Number(body.trainerPrice || 0),
                subject: Array.isArray(body.subject) ? body.subject : [body.subject],
                status: body.status || 'scheduled',
            };
            const newCourse = await useCase.execute(data);
            return res.status(201).json(newCourse);
        }

        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    } catch (error) {
        console.error('[/api/courses]', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default requireAuth(handler);
