/**
 * Server-side auth utilities
 * JWT-based authentication with HttpOnly cookie strategy
 */
import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_jwt_secret_CHANGE_ME';
const COOKIE_NAME = 'seminar_token';

export interface AuthPayload {
    userId: string;
    username: string;
    role: 'admin';
}

export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): AuthPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
        return null;
    }
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
    // Prefer HttpOnly cookie
    const fromCookie = req.cookies[COOKIE_NAME];
    if (fromCookie) return fromCookie;

    // Fallback: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

export function requireAuth(
    handler: (req: NextApiRequest, res: NextApiResponse, user: AuthPayload) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized – no token provided' });
        }

        const user = verifyToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized – invalid or expired token' });
        }

        return handler(req, res, user);
    };
}

export { COOKIE_NAME };
