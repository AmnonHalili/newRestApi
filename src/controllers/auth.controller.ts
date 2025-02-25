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
            console.log("JWT_SECRET:", config.JWT_SECRET);
            console.log("JWT_EXPIRATION:", config.JWT_EXPIRATION);

            const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
                expiresIn: config.JWT_EXPIRATION
            });

            const refreshToken = jwt.sign({ userId: user.id }, config.JWT_REFRESH_SECRET, {
                expiresIn: config.JWT_REFRESH_EXPIRATION
            });

            res.status(201).json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token,
                refreshToken
            });
        } catch (error) {
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

            const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, {
                expiresIn: config.JWT_EXPIRATION
            });

            const refreshToken = jwt.sign({ userId: user.id }, config.JWT_REFRESH_SECRET, {
                expiresIn: config.JWT_REFRESH_EXPIRATION
            });

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token,
                refreshToken
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in' });
        }
    }

    static async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;

            const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string };
            const token = jwt.sign({ userId: decoded.userId }, config.JWT_SECRET, {
                expiresIn: config.JWT_EXPIRATION
            });

            res.json({ token });
        } catch (error) {
            res.status(401).json({ message: 'Invalid refresh token' });
        }
    }
}