import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env.local') });

export async function login(req: Request, res: Response, next: NextFunction) {
    console.log('LOGIN body:', req.body);

    try {
        const { username, password } = req.body;
        const user = await AuthService.authenticateUser(username, password);

        const token = AuthService.createSessionToken({ id: user.usr_id, role: user.usr_role  }); // Generate a token for the user

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the token
            secure: isProd, // Use secure cookies in production
            sameSite: 'lax', // Helps prevent CSRF attacks
            path: '/', // Cookie is accessible on all routes
            // domain: 'dekdee2.informatics.buu.ac.th', // ใส่เมื่อโปรดักชันถ้าจำเป็น
            maxAge: 60 * 60 * 1000 // 1 hour expiration
        });

        return res.json({ message: 'Login successful', user });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        // Clear the session or token here
        res.clearCookie('access_token', { path: '/' });
        return res.json({ message: 'Logout successful' });
    } catch (err) {
        next(err);
    }
}

export async function register(req: Request, res: Response, next: NextFunction) {}