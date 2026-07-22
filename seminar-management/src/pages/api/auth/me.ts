/**
 * GET /api/auth/me – Verify current session and return user payload
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, AuthPayload } from '@server/infrastructure/auth/jwt';

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthPayload) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    return res.status(200).json({ userId: user.userId, username: user.username, role: user.role });
}

export default requireAuth(handler);
