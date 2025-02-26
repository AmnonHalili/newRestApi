import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) {
            console.error('Authorization header is missing');
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            console.error('Token is missing in Authorization header');
            return res.status(401).json({ message: 'Authentication required' });
        }

        // בדיקת תקינות הטוקן
        const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };

        if (!decoded.userId) {
            console.error('Decoded token does not contain userId:', decoded);
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.userId = decoded.userId;
        console.log('Authenticated userId:', req.userId);

        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
