import { Request, Response, NextFunction } from 'express';
import * as AuthService from '../services/auth.service';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env.local') });

/**
 * จัดการการเข้าสู่ระบบของผู้ใช้
 *
 * - ตรวจสอบ username/email และ password
 * - สร้าง session token และเก็บไว้ใน cookie
 *
 * @route POST /api/auth/login
 * @param {Request} req - Express request object (body: { usernameOrEmail, password })
 * @param {Response} res - Express response object (ส่ง token และข้อมูล user)
 * @param {NextFunction} next - Express next middleware
 * @returns {Promise<Response>} JSON response → { message, success, user }
 *
 * @author Wanasart
 */
export async function login(req: Request, res: Response, next: NextFunction) {
    console.log('LOGIN body:', req.body);

    try {
        const { usernameOrEmail, password } = req.body;
        const user = await AuthService.authenticateUser(usernameOrEmail, password);

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

        return res.json({ message: 'Login successful', success: true, user });
    } catch (err) {
        next(err);
    }
}

/**
 * จัดการการออกจากระบบของผู้ใช้
 *
 * - ลบ cookie ที่เก็บ session token
 *
 * @route POST /api/auth/logout
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งข้อความยืนยัน logout)
 * @param {NextFunction} next - Express next middleware
 * @returns {Promise<Response>} JSON response → { message }
 *
 * @author Wanasart
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        // Clear the session or token here
        res.clearCookie('access_token', { path: '/' });
        return res.json({ message: 'Logout successful' });
    } catch (err) {
        next(err);
    }
}

/**
 * สมัครสมาชิกผู้ใช้ใหม่
 *
 * - ตรวจสอบ username/email ว่าซ้ำหรือไม่
 * - Hash password และสร้างผู้ใช้ใหม่
 * - คืน user object + session token
 *
 * @route POST /api/register
 * @param {Request} req - Express request object (body: { username, email, password, role })
 * @param {Response} res - Express response object (ส่งข้อมูล user + token)
 * @param {NextFunction} next - Express next middleware
 * @returns {Promise<Response>} JSON response → { message, user, token }
 *
 * @author Wanasart
 */
export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email, password, role } = req.body;

        const { user, token } = await AuthService.registerUser(username, email, password, role);

        return res.json({ message: 'Register successful', user, token });
    } catch (err) {
        next(err);
    }
}