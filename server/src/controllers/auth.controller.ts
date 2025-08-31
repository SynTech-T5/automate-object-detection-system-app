import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, getUserSafeById, verifyPassword } from '../services/auth.service';
import * as AuthService from '../services/auth.service';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env.local') });

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_NAME = process.env.COOKIE_NAME || 'access_token';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined; // เช่น ".example.com"
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE as 'lax' | 'none' | 'strict') || 'lax';
const COOKIE_MAX_AGE_MS = Number(process.env.COOKIE_MAX_AGE_MS ?? 60 * 60 * 1000);
const COOKIE_MAX_AGE_REMEMBER_MS = Number(
  process.env.COOKIE_MAX_AGE_REMEMBER_MS ?? 7 * 24 * 60 * 60 * 1000
);
const COOKIE_MAX_AGE_TEST_MS = Number(
  process.env.COOKIE_MAX_AGE_TEST_MS ?? 5000
);

const cookieBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: COOKIE_SAMESITE,
  path: '/',
  // domain: COOKIE_DOMAIN,
} as const;

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
  try {
    const { usernameOrEmail, password, remember } = req.body as {
      usernameOrEmail: string; password: string; remember?: boolean;
    };

    const user = await AuthService.authenticateUser(usernameOrEmail, password, !!remember);

    // ⬇️ ออกโทเค็นตามอายุที่เลือก (1h หรือ 7d)
    const token = AuthService.createSessionToken(
      { id: user.usr_id, role: user.usr_role },
      { remember: !!remember }
    );

    // ⬇️ ตั้งอายุคุกกี้ตาม remember
    const maxAge = !!remember ? COOKIE_MAX_AGE_REMEMBER_MS : COOKIE_MAX_AGE_MS;
    // const maxAge = !!remember ? COOKIE_MAX_AGE_TEST_MS : COOKIE_MAX_AGE_MS; // ⬅️ สำหรับทดสอบ
    res.cookie(COOKIE_NAME, token, { ...cookieBase, maxAge });

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
    // ✅ เวอร์ชันต่าง ๆ ที่อาจหลงเหลือมาจากการตั้งค่าเก่า
    const variants = [
      { ...cookieBase },                    // มี domain (ถ้าตั้ง)
      { path: '/' },                        // host-only (ไม่มี domain)
      { path: '/api' },                     // เผื่อเคยตั้ง path = /api
      ...(COOKIE_DOMAIN ? [{ path: '/', domain: undefined as any }] : []), // ลบ host-only แม้ปัจจุบันมี domain
    ];

    for (const v of variants) {
      res.clearCookie(COOKIE_NAME, v);
      res.cookie(COOKIE_NAME, '', { ...v, maxAge: 0 });
    }

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

/**
 * ตรวจสอบสถานะการเข้าสู่ระบบของผู้ใช้
 *
 * - ใช้ session token ที่เก็บใน cookie เพื่อตรวจสอบตัวตน
 * - คืนข้อมูลผู้ใช้ที่ปลอดภัย (ไม่มี password)
 *
 * @route GET /api/auth/me
 * @param {Request} req - Express request object (cookie: access_token)
 * @param {Response} res - Express response object (ส่งข้อมูลผู้ใช้)
 * @param {NextFunction} next - Express next middleware
 * @returns {Promise<Response>} JSON response → { usr_id, usr_username, usr_email, usr_role }
 *
 * @author Wanasart
 */
export async function me(req: Request, res: Response, next: NextFunction) {
  res.set({ 'Cache-Control': 'no-store', 'Pragma': 'no-cache', 'Vary': 'Cookie' });

  try {
    const token = req.cookies?.[COOKIE_NAME]; // ⬅️ ใช้ COOKIE_NAME
    if (!token) return res.status(401).json({ error: 'Unauthenticated' });

    const payload = verifySessionToken(token);
    const user = await getUserSafeById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    return res.json({
      usr_id: user.usr_id,
      usr_username: user.usr_username,
      usr_email: user.usr_email,
      usr_role: user.usr_role,
    });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


/**
 * เป็นการตรวจสอบรหัสผ่านก่อนเพิ่ม camera
 *
 * - ใช้ token เพื่อเก็บค่าผู้ใช้งานที่กำลัง login อยู่
 * - และทำการตรวจสอบว่า token หมดอายุหรือยัง
 * 
 *
 * @route Post /api/auth/recheckPassword
 * @param {Request} req - Express request object (cookie: access_token)
 * @param {Response} res - Express response object (ส่งข้อมูลผู้ใช้)
 * @returns {success: true } คืนค่า true หากรหัสผ่านถูกต้อง
 *
 * @author Chokchai
 */

export async function recheckPassword(req: Request, res: Response) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ error: "Unauthenticated" });

    const payload = verifySessionToken(token); // ตรวจสอบว่า token ถูกต้อง และยังไม่หมดอายุ
    const { password } = req.body; //เก็บค่าเฉพาะ password

    const ok = await verifyPassword(payload.id, password);

    if (!ok) {
      return res.status(401).json({ error: "Password incorrect" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("recheckPassword error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}