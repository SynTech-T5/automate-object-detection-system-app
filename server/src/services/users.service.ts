import { pool } from "../config/db";
import * as Model from "../models/users.model";
import * as Mapping from "../models/Mapping/users.map";
import bcrypt from 'bcrypt';

/**
 * ดึงข้อมูลผู้ใช้งานจากฐานข้อมูลตามรหัสที่ระบุ
 * ใช้สำหรับโหลดข้อมูลผู้ใช้เพื่อแสดงในหน้าโปรไฟล์ หรือหน้าจัดการผู้ใช้
 *
 * @async
 * @function getUserById
 * @param {number} user_id - รหัสผู้ใช้งานที่ต้องการค้นหา
 * @returns {Promise<Model.User>} ข้อมูลผู้ใช้ที่พบ (หรือ undefined หากไม่พบ)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function getUserById(user_id: number){
    const { rows } =  await pool.query(`
        SELECT
            usr_id, 
            usr_rol_id, 
            usr_username, 
            usr_email, 
            usr_name, 
            usr_phone, 
            usr_profile, 
            usr_created_at, 
            usr_updated_at, 
            usr_is_use 
        FROM users
        WHERE usr_id = $1;
    `, [user_id]);

    return Mapping.mapUserToSaveResponse(rows[0]);
}

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้งานตามรหัสที่ระบุ
 * ปรับปรุงชื่อ เบอร์โทร อีเมล และอัปเดตเวลาแก้ไข (usr_updated_at) ให้เป็นปัจจุบัน
 * คืนค่าข้อมูลผู้ใช้ที่อัปเดตแล้ว (ไม่รวมรหัสผ่าน)
 *
 * @async
 * @function updateProfile
 * @param {number} user_id - รหัสผู้ใช้งานเป้าหมาย
 * @param {string} name - ชื่อที่ต้องการอัปเดต (ระบบจะ trim ช่องว่างให้)
 * @param {string} phone - เบอร์โทรศัพท์ที่ต้องการอัปเดต (ระบบจะ trim ช่องว่างให้)
 * @param {string} email - อีเมลที่ต้องการอัปเดต (ระบบจะ trim ช่องว่างให้)
 * @returns {Promise<{
 *   usr_id: number,
 *   usr_username: string,
 *   usr_name: string,
 *   usr_phone: string,
 *   usr_email: string,
 *   usr_rol_id: number,
 *   usr_updated_at: string
 * }>} ออบเจ็กต์ผู้ใช้ที่ถูกอัปเดต (ฟิลด์ปลอดภัย ไม่รวมรหัสผ่าน)
 * @throws {Error} หากไม่พบผู้ใช้งานที่ระบุ (User not found) หรือเกิดข้อผิดพลาดฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function updateProfile(
  user_id: number,
  name: string,
  phone: string,
  email: string
) {
    const { rows } = await pool.query(
      `
      UPDATE users
      SET 
        usr_name = $1,
        usr_phone = $2,
        usr_email = $3,
        usr_updated_at = CURRENT_TIMESTAMP
      WHERE usr_id = $4
      RETURNING usr_id, usr_username, usr_name, usr_phone, usr_email, usr_rol_id, usr_updated_at;
      `,
      [name.trim(), phone.trim(), email.trim(), user_id]
    );

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    return rows[0];
}

/**
 * เปลี่ยนรหัสผ่านของผู้ใช้งานตามรหัสที่ระบุ
 * ระบบจะทำการแฮชรหัสผ่านใหม่ด้วย bcrypt (saltRounds = 12) และอัปเดตเวลาแก้ไข
 *
 * ข้อควรระวัง: ส่งรหัสผ่านเข้าฟังก์ชันนี้ผ่านช่องทางที่ปลอดภัยเท่านั้น (HTTPS)
 *
 * @async
 * @function updatePassword
 * @param {number} user_id - รหัสผู้ใช้งานเป้าหมาย
 * @param {string} password - รหัสผ่านใหม่ (Plain text ที่จะถูกแฮชภายในฟังก์ชัน)
 * @returns {Promise<{ success: boolean, message: string }>} สถานะการอัปเดตและข้อความยืนยัน
 * @throws {Error} หากไม่พบผู้ใช้งานที่ระบุ (User not found) หรือเกิดข้อผิดพลาดฐานข้อมูล/การแฮช
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function updatePassword(
  user_id: number,
  password: string
) {
    const hashed = await bcrypt.hash(password, 12);

    const { rowCount } = await pool.query(
      `
      UPDATE users
      SET usr_password = $1,
          usr_updated_at = CURRENT_TIMESTAMP
      WHERE usr_id = $2;
      `,
      [hashed, user_id]
    );

    if (rowCount === 0) {
      throw new Error("User not found");
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
}