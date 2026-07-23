/**
 * POST /api/auth/login  – Issue JWT token as HttpOnly cookie
 * POST /api/auth/logout – Clear auth cookie
 *
 * NOTE: In a real system, users would be stored in the DB with hashed passwords.
 * For this assessment a static admin user is used for simplicity.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { signToken, COOKIE_NAME } from '@server/infrastructure/auth/jwt';
import { prisma } from '@server/infrastructure/database/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body as { username: string; password: string };

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        } // trigger ts

        // Auto-seed admin user if it does not exist (for assessment purposes)
        const userCount = await (prisma as any).user.count();
        if (userCount === 0) {
            const ADMIN_PASSWORD_HASH = '$2b$12$AafJaMU.tf0lP69u/JTiyei.F/HYPYwLxnrip0LlnUA2IzuYEq6DK'; // hash of 'password'
            await (prisma as any).user.create({
                data: {
                    username: 'admin',
                    password: ADMIN_PASSWORD_HASH,
                    role: 'admin',
                },
            });
        }

        const user = await (prisma as any).user.findUnique({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ userId: user.id, username: user.username, role: user.role });

        const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
        const cookieHeader = `${COOKIE_NAME}=${token}; HttpOnly; ${secure} SameSite=Lax; Max-Age=${60 * 60 * 8}; Path=/`;

        res.setHeader('Set-Cookie', cookieHeader);
        return res.status(200).json({ message: 'Logged in successfully', username: user.username });
    }

    if (req.method === 'DELETE') {
        const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
        const expired = `${COOKIE_NAME}=; HttpOnly; ${secure} SameSite=Lax; Max-Age=0; Path=/`;
        res.setHeader('Set-Cookie', expired);
        return res.status(200).json({ message: 'Logged out' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
