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

export async function authenticateUser(usernameOrEmail: string, password: string) {
    // console.log(`Authenticating user: ${usernameOrEmail} with password: ${password}`);
    const { rows } = await pool.query<UserRow>(`
        SELECT * FROM users 
        JOIN roles ON usr_role_id = rol_id 
        WHERE (usr_username = $1 OR usr_email = $1) AND usr_is_use = true
    `, [usernameOrEmail]);

    const user = rows[0];
    if (!user) {
        throw new Error('User not found');
    }

    const ok = await bcrypt.compare(password, user.usr_password);
    // const ok = await password == user.usr_password;
    if (!ok) {
        throw new Error('Invalid password');
    }
    
    return toUserSafe(user);
}

export async function registerUser(username: string, email: string, password: string, role: string) {
    const existing = await pool.query<UserRow>(`
        SELECT * FROM users
        WHERE usr_username = $1 OR usr_email = $2
    `, [username, email]);
    if (existing.rows.length > 0){
        throw new Error('Username or email already exists');
    }

    const roleRes = await pool.query<{ rol_id: number }>(`
        SELECT rol_id FROM roles
        WHERE rol_name = $1
    `, [role]);
    if (roleRes.rows.length === 0){
        throw new Error('Role not found');
    }
    const role_id = roleRes.rows[0]?.rol_id;

    const hashPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { rows } = await pool.query(`
        INSERT INTO users(usr_username, usr_email, usr_password ,usr_role_id)
        VALUES($1, $2, $3, $4)
        RETURNING usr_id, usr_username, usr_email, usr_role_id,
              (SELECT rol_name FROM roles WHERE rol_id = $4) AS usr_role
    `, [username, email, hashPassword, role_id]);

    const user = rows[0];
    if (!user) {
        throw new Error('Failed to register user');
    }

    const safeUser = toUserSafe(user);
    const token = createSessionToken({ id: user.usr_id, role: user.usr_role });

    return { user: safeUser, token };
}