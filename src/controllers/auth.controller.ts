import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { config } from '../config/config';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;

            const existingUser = await UserModel.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = await UserModel.create({
                username,
                email,
                password
            });

            // בדיקה אם ה-JWT_SECRET תקין
            if (!config.JWT_SECRET || typeof config.JWT_SECRET !== 'string') {
                console.error("JWT_SECRET is not defined or invalid");
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const token = jwt.sign(
                { userId: user._id.toString() },
                config.JWT_SECRET as string,
                { expiresIn: config.JWT_EXPIRATION as string }
            );

            // בדיקה אם ה-JWT_REFRESH_SECRET תקין
            if (!config.JWT_REFRESH_SECRET || typeof config.JWT_REFRESH_SECRET !== 'string') {
                console.error("JWT_REFRESH_SECRET is not defined or invalid");
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const refreshToken = jwt.sign(
                { userId: user._id.toString() },
                config.JWT_REFRESH_SECRET as string,
                { expiresIn: config.JWT_REFRESH_EXPIRATION as string }
            );

            res.status(201).json({
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                token,
                refreshToken
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!config.JWT_SECRET || typeof config.JWT_SECRET !== 'string') {
                console.error("JWT_SECRET is not defined or invalid");
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const token = jwt.sign(
                { userId: user._id.toString() },
                config.JWT_SECRET as string,
                { expiresIn: config.JWT_EXPIRATION as string }
            );

            if (!config.JWT_REFRESH_SECRET || typeof config.JWT_REFRESH_SECRET !== 'string') {
                console.error("JWT_REFRESH_SECRET is not defined or invalid");
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const refreshToken = jwt.sign(
                { userId: user._id.toString() },
                config.JWT_REFRESH_SECRET as string,
                { expiresIn: config.JWT_REFRESH_EXPIRATION as string }
            );

            res.json({
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                token,
                refreshToken
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error logging in' });
        }
    }

    static async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;

            if (!config.JWT_REFRESH_SECRET || typeof config.JWT_REFRESH_SECRET !== 'string') {
                console.error("JWT_REFRESH_SECRET is not defined or invalid");
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET as string) as { userId: string };

            if (!config.JWT_SECRET || typeof config.JWT_SECRET !== 'string') {
                console.error("JWT_SECRET is not defined or invalid");
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const token = jwt.sign(
                { userId: decoded.userId },
                config.JWT_SECRET as string,
                { expiresIn: config.JWT_EXPIRATION as string }
            );

            res.json({ token });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({ message: 'Invalid refresh token' });
        }
    }
}
