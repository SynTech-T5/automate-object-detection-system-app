import { pool } from '../config/db';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env.local') });
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRow, UserSafe } from '../models/users.model';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';
const JWT_EXPIRES_REMEMBER = process.env.JWT_EXPIRES_REMEMBER || '7d'; // ⬅️ เพิ่มบรรทัดนี้
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;
const JWT_EXPIRES_TEST = process.env.JWT_EXPIRES_TEST;

/**
 * สร้าง JWT session token จาก payload
 *
 * @param {{ id: number, role: string }} payload - object ที่ประกอบด้วย user id และ role
 * @returns {string} JWT token ที่เข้ารหัสแล้ว
 *
 * @author Wanasart
 */
export function createSessionToken(
    payload: { id: number; role: string },
    opts?: { remember?: boolean; expiresIn?: string | number }
  ) {
    const expiresIn = opts?.expiresIn ?? (opts?.remember ? JWT_EXPIRES_REMEMBER : JWT_EXPIRES);
    // const expiresIn = opts?.expiresIn ?? (opts?.remember ? JWT_EXPIRES_TEST : JWT_EXPIRES); // ⬅️ สำหรับทดสอบ
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

/**
 * ตรวจสอบความถูกต้องของ JWT session token
 *
 * @param {string} token - JWT token ที่ต้องการตรวจสอบ
 * @returns {{ id: number, role: string }} payload ที่ decode ออกมา (id และ role ของผู้ใช้)
 *
 * @author Wanasart
 */
export function verifySessionToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { id: number, role: string };
}

/**
 * แปลงข้อมูลผู้ใช้จากตาราง users ให้อยู่ในรูปแบบ UserSafe
 *
 * @param {UserRow} user - แถวข้อมูลผู้ใช้จาก DB (รวม password)
 * @returns {UserSafe} object ที่ปลอดภัย (ไม่มี password)
 *
 * @author Wanasart
 */
function toUserSafe(row: any): UserSafe {
  const role =
    row.role_name ??     // มาตรฐานใหม่
    row.usr_role ??      // เผื่อเคย alias แบบนี้
    row.rol_name ?? null; // เผื่อยังไม่ได้แก้

  return {
    usr_id: row.usr_id,
    usr_username: row.usr_username,
    usr_email: row.usr_email,
    usr_role: row.rol_name,
  };
}

/**
 * ตรวจสอบการเข้าสู่ระบบของผู้ใช้
 *
 * @param {string} usernameOrEmail - username หรือ email ที่ผู้ใช้กรอก
 * @param {string} password - password ที่ผู้ใช้กรอก
 * @throws {Error} ถ้า user ไม่พบ หรือ password ไม่ถูกต้อง
 * @returns {Promise<UserSafe>} user object ที่ปลอดภัย (ไม่คืน password)
 *
 * @author Wanasart
 */
export async function authenticateUser(usernameOrEmail: string, password: string, remember: boolean = false): Promise<UserSafe> {
    // console.log(`Authenticating user: ${usernameOrEmail} with password: ${password}`);
    const { rows } = await pool.query<UserRow>(`
        SELECT 
            usr_id,
            usr_username,
            usr_email,
            usr_password,
            rol_name 
        FROM users 
        JOIN roles ON usr_rol_id = rol_id 
        WHERE 
            (usr_username = $1 OR usr_email = $1) 
        AND 
            usr_is_use = true
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
    
    console.log(toUserSafe(user));
    return toUserSafe(user);
}

/**
 * สมัครสมาชิกผู้ใช้ใหม่
 *
 * @param {string} username - username ที่ต้องการ
 * @param {string} email - email ของผู้ใช้
 * @param {string} password - password ของผู้ใช้ (จะถูก hash ด้วย bcrypt)
 * @param {string} role - role ของผู้ใช้ เช่น "admin" "security officer" หรือ "staff"
 * @throws {Error} ถ้า username หรือ email ซ้ำ หรือ role ไม่พบ
 * @returns {Promise<{ user: UserSafe, token: string }>} user object ที่ปลอดภัย + JWT token
 *
 * @author Wanasart
 */
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
        INSERT INTO users(usr_username, usr_email, usr_password ,usr_rol_id)
        VALUES($1, $2, $3, $4)
        RETURNING usr_id, usr_username, usr_email, usr_rol_id,
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

/**
 * ดึงข้อมูลผู้ใช้ตาม ID โดยไม่รวม password
 *
 * @param {number} id - รหัสผู้ใช้ที่ต้องการดึงข้อมูล
 * @returns {Promise<UserSafe | null>} user object ที่ปลอดภัย (ไม่มี password) หรือ null ถ้าไม่พบ
 *
 * @author Wanasart
 */
export async function getUserSafeById(id: number): Promise<UserSafe | null> {

    const { rows } = await pool.query<UserRow>(`
        SELECT 
            usr_id,
            usr_username,
            usr_email,
            rol_name 
        FROM users 
        JOIN roles ON usr_rol_id = rol_id 
        WHERE 
            usr_id = $1 
        AND 
            usr_is_use = true
        LIMIT 1;
    `, [id]);
  
    const user = rows[0];
    return user ? toUserSafe(user) : null;
}  

/**
 * ตรวจสอบรหัสผ่านก่อนทำการเพิ่มข้อมูลกล้อง
 *
 * @param {number} userId - id ของที่ใช้งานอยู่
 * @param {string} password รหัสผ่านที่กรอกมา
 * @returns {Promise<boolean>} คืนค่า True หากรหัสผ่านที่ป้อนมาตรงกับผู้ที่ใช้งานอยู่
 *
 * @author Chokchai
 */

export async function verifyPassword(userId: number, password: string): Promise<boolean> {
  // ดึง hash password ของ user จาก DB
  const result = await pool.query(
    "SELECT usr_password FROM users WHERE usr_id = $1 AND usr_is_use = true",
    [userId]
  );

  if (result.rows.length === 0) {
    return false; // ไม่เจอ user
  }

  const hash = result.rows[0].usr_password;
  const ok = await bcrypt.compare(password, hash);
  return ok; // true = password ถูก, false = ผิด
}