import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/infrastructure/database/prisma';
import { requireAuth } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const totalCourses = await prisma.course.count();
        const totalTrainers = await prisma.trainer.count();
        const upcomingCourses = await prisma.course.count({
            where: { status: 'scheduled', date: { gte: new Date() } },
        });
        const completedCourses = await prisma.course.count({
            where: { status: 'completed' },
        });

        return res.status(200).json({
            totalCourses,
            totalTrainers,
            upcomingCourses,
            completedCourses,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default requireAuth(handler);
