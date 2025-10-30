import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/users.service";

/**
 * ดึงข้อมูลผู้ใช้งานตามรหัสจาก API
 * เหมาะสำหรับใช้ใน endpoint เช่น `/api/users/:usr_id`
 *
 * @param {Request} req - Express Request ที่มี usr_id ใน params
 * @param {Response} res - Express Response สำหรับส่งข้อมูลกลับไป
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลผู้ใช้งานที่พบและข้อความยืนยันการดึงข้อมูลสำเร็จ
 * @throws {Error} หากไม่พบผู้ใช้หรือเกิดข้อผิดพลาดระหว่างการเรียก service
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const user = await UserService.getUserById(user_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: user });
    } catch (err) {
        next(err);
    }
}

/**
 * อัปเดตข้อมูลโปรไฟล์ผู้ใช้งานตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขชื่อ เบอร์โทร และอีเมลของผู้ใช้งาน จากนั้นคืนค่าข้อมูลผู้ใช้ที่อัปเดตแล้ว
 *
 * @param {Request} req - Express Request ที่มี usr_id ใน params และ { name, phone, email } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลผู้ใช้ที่ถูกอัปเดตสำเร็จ
 * @throws {Error} หากไม่พบผู้ใช้หรือเกิดข้อผิดพลาดระหว่างอัปเดตฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const { 
            name, 
            phone, 
            email 
        } = req.body;

        const user = await UserService.updateProfile(user_id, name, phone, email);
        
        return res.status(200).json({ message: 'Updated successfully', data: user });
    } catch (err) {
        next(err);
    }
}

/**
 * เปลี่ยนรหัสผ่านของผู้ใช้งานตามรหัสที่ระบุ
 * ระบบจะทำการแฮชรหัสผ่านใหม่ในชั้น Service และอัปเดตเวลาแก้ไข จากนั้นคืนค่าสถานะสำเร็จ
 *
 * @param {Request} req - Express Request ที่มี usr_id ใน params และ { password } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ออบเจ็กต์สถานะผลลัพธ์การอัปเดตรหัสผ่าน
 * @throws {Error} หากไม่พบผู้ใช้หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล/แฮชรหัสผ่าน
 *
 * @author Wanasart
 * @lastModified 2025-10-30
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = Number(req.params.usr_id);
        const { password } = req.body;

        const user = await UserService.updatePassword(user_id, password);
        
        return res.status(200).json({ message: 'Updated successfully', data: user });
    } catch (err) {
        next(err);
    }
}