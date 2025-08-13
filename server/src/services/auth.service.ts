import { pool } from '../config/db';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env.local') });
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRow, UserSafe } from '../models/users.model';


const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export function createSessionToken(payload: { id: number, role: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifySessionToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { id: number, role: string };
}

function toUserSafe(user: UserRow): UserSafe {
    return {
        usr_id: user.usr_id,
        usr_username: user.usr_username,
        usr_email: user.usr_email,
        usr_role: user.usr_role
    };
}

export async function authenticateUser(username: string, password: string) {
    const { rows } = await pool.query<UserRow>(`
        SELECT * FROM users JOIN roles ON usr_role_id = rol_id WHERE usr_username = $1 AND usr_is_use = true
    `, [username]);

    const user = rows[0];
    if (!user) {
        throw new Error('User not found');
    }

    // const ok = await bcrypt.compare(password, user.usr_password);
    const ok = password;
    if (!ok) {
        throw new Error('Invalid password');
    }
    
    return toUserSafe(user);
}

export async function registerUser(username: string, password: string) { }