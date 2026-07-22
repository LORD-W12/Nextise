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

// Static admin credentials — in production, query from DB with bcrypt
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD_HASH =
    process.env.ADMIN_PASSWORD_HASH ??
    // Default: bcrypt hash of "password" (12 rounds)
    '$2a$12$K7gVqG.7b0HxvPOHb3E5UupUiQ4LXxOwg2DRYF88VShCXTIW7c1M6';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body as { username: string; password: string };

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const isValidUser = username === ADMIN_USERNAME;
        const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

        if (!isValidUser || !isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken({ userId: '1', username, role: 'admin' });

        const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
        const cookieHeader = `${COOKIE_NAME}=${token}; HttpOnly; ${secure} SameSite=Lax; Max-Age=${60 * 60 * 8}; Path=/`;

        res.setHeader('Set-Cookie', cookieHeader);
        return res.status(200).json({ message: 'Logged in successfully', username });
    }

    if (req.method === 'DELETE') {
        const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
        const expired = `${COOKIE_NAME}=; HttpOnly; ${secure} SameSite=Lax; Max-Age=0; Path=/`;
        res.setHeader('Set-Cookie', expired);
        return res.status(200).json({ message: 'Logged out' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
