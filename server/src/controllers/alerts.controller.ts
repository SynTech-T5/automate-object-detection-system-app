import { Request, Response, NextFunction } from "express";
import * as AlertService from "../services/alerts.service";
import { stringify } from "querystring";

/**
 * ดึงรายการ Alerts ล่าสุดทั้งหมดจากระบบ
 * ใช้สำหรับหน้า Overview / List โดยเรียงจากรายการที่สร้างล่าสุดมาก่อน
 *
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการ Alert overview ทั้งหมด
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-27
 */
export async function getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await AlertService.getAlerts();
        
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
}

/**
 * ดึงรายละเอียด Alert รายการเดียวตามรหัสที่ระบุ
 * เหมาะสำหรับหน้า Alert Detail
 *
 * @param {Request} req - Express Request ที่มีพารามิเตอร์ alr_id
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูล Alert ที่พบ (หรือ null/undefined หากไม่พบ)
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการค้นหาในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-27
 */
export async function getAlertById(req: Request, res: Response, next: NextFunction) {
    try {
        const alert_id = Number(req.params.alr_id);
        const list = await AlertService.getAlertById(alert_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
}

/**
 * ดึงประวัติการทำรายการ (Logs) ของ Alert ตามรหัสที่ระบุ
 * รวมข้อมูลผู้ใช้งานและบทบาท เพื่อการติดตามการเปลี่ยนแปลงย้อนหลัง
 *
 * @param {Request} req - Express Request ที่มีพารามิเตอร์ alr_id
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการ Logs ที่เกี่ยวข้องกับ Alert
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function getAlertLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const alert_id = Number(req.params.alr_id);
        const logs = await AlertService.getAlertLogs(alert_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: logs });
    } catch (err) {
        next(err);
    }
}

/**
 * ดึงรายการ Alert ที่เกี่ยวข้อง (Related) โดยอ้างอิงจากเหตุการณ์เดียวกัน (event_name)
 * ใช้แสดง Alert ที่มีลักษณะเหตุการณ์เดียวกัน เรียงตามเวลาที่สร้างล่าสุด
 *
 * @param {Request} req - Express Request ที่มีพารามิเตอร์ alr_id (ใช้ค้นหา event อ้างอิง)
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการ Alert ที่เกี่ยวข้องตาม event เดียวกัน
 * @throws {Error} หากไม่พบ event อ้างอิงหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function getAlertRelated(req: Request, res: Response, next: NextFunction) {
    try {
        const alert_id = Number(req.params.alr_id);
        const related = await AlertService.getAlertRelated(alert_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: related });
    } catch (err) {
        next(err);
    }
}

/**
 * ดึงบันทึกข้อความ (Notes) ของ Alert ตามรหัสที่ระบุ
 * คัดเฉพาะรายการที่ยังใช้งานอยู่ และเรียงตามเวลาที่สร้างล่าสุด
 *
 * @param {Request} req - Express Request ที่มีพารามิเตอร์ alr_id
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการบันทึกข้อความของ Alert
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function getAlertNotes(req: Request, res: Response, next: NextFunction) {
    try {
        const alert_id = Number(req.params.alr_id);
        const notes = await AlertService.getAlertNotes(alert_id);
        
        return res.status(200).json({ message: 'Fetched successfully', data: notes });
    } catch (err) {
        next(err);
    }
}

/**
 * ดึงรายการกล้องที่มี Alert ภายใน 24 ชั่วโมงล่าสุด
 * อ้างอิงจากมุมมอง v_cameras_latest_alert
 *
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการกล้องพร้อมเวลา Alert ล่าสุดในช่วง 24 ชั่วโมง
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-29
 */
export async function getRecentCameraAlert(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await AlertService.getRecentCameraAlert();
        
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
}

/**
 * เพิ่มบันทึกข้อความ (Note) ให้กับ Alert ที่ระบุ
 * ระบบจะกำหนดเวลา created/updated เป็นปัจจุบันโดยอัตโนมัติ
 *
 * @param {Request} req - Express Request ที่มี alr_id ใน params และ { user_id, note } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} บันทึกข้อความที่ถูกสร้างใหม่
 * @throws {Error} หากไม่สามารถสร้างบันทึกได้หรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function createAlertNote(req: Request, res: Response, next: NextFunction) {
    try {
        const alert_id = Number(req.params.alr_id);
        const { 
            user_id, 
            note 
        } = req.body;

        const newNote = await AlertService.insertAlertNote(
            user_id, 
            alert_id, note
        );
        
        return res.status(201).json({ message: 'Created successfully', data: newNote });
    } catch (err) {
        next(err);
    }
}

/**
 * แก้ไขบันทึกข้อความ (Note) ของ Alert ตามรหัสบันทึกที่ระบุ
 * ระบบจะอัปเดตเวลาแก้ไขล่าสุดเป็นปัจจุบันโดยอัตโนมัติ
 *
 * @param {Request} req - Express Request ที่มี anh_id ใน params และ { user_id, note } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} บันทึกข้อความที่ถูกอัปเดตแล้ว
 * @throws {Error} หากไม่พบบันทึกที่ต้องการอัปเดตหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function updateAlertNote(req: Request, res: Response, next: NextFunction) {
    try {
        const note_id = Number(req.params.anh_id);
        const { 
            user_id, 
            note 
        } = req.body;

        const newNote = await AlertService.updateAlertNote( 
            user_id, 
            note_id, note
        );

        return res.status(200).json({ message: 'Updated successfully', data: newNote });
    } catch (err) {
        next(err);
    }
}

/**
 * ลบบันทึกข้อความ (Note) แบบ Soft Delete โดยตั้งค่าให้ไม่ใช้งาน
 *
 * @param {Request} req - Express Request ที่มี anh_id ใน params
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} บันทึกข้อความที่ถูกปิดการใช้งานแล้ว
 * @throws {Error} หากไม่พบบันทึกที่ต้องการลบหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-28
 */
export async function softDeleteAlertNote(req: Request, res: Response, next: NextFunction) {
    try {
        const note_id = Number(req.params.anh_id);
        const newNote = await AlertService.removeAlertNote(note_id);

        return res.status(200).json({ message: 'Deleted successfully', data: newNote });
    } catch (err) {
        next(err);
    }
}

/**
 * สร้าง Alert ใหม่และส่งคืนข้อมูลที่ถูกบันทึก
 * ใช้เมื่อเกิดเหตุการณ์ที่ต้องแจ้งเตือน พร้อมผูกกับผู้ใช้/กล้อง/ฟุตเทจ/เหตุการณ์
 *
 * @param {Request} req - Express Request ที่มี { user_id, camera_id, footage_id, event_id, severity, description } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูล Alert ที่ถูกสร้างสำเร็จ
 * @throws {Error} หากไม่สามารถสร้าง Alert ได้หรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-27
 */
export async function createAlert(req: Request, res: Response, next: NextFunction) {
    try {
        const { 
            user_id, 
            camera_id, 
            footage_id, 
            event_id, 
            severity, 
            description 
        } = req.body;

        const alert = await AlertService.insertAlert(
            user_id, 
            camera_id, 
            footage_id, 
            event_id, 
            severity, 
            description
        );
        
        return res.status(201).json({ message: 'Created successfully', data: alert });
    } catch (err) {
        next(err);
    }
}

/**
 * อัปเดตสถานะ (status) และสาเหตุ (reason) ของ Alert ที่ระบุ
 * เหมาะสำหรับกรณีเปลี่ยนเป็น resolved/dismissed หรือสถานะอื่นตามธุรกิจ พร้อมบันทึกเหตุผล
 *
 * @param {Request} req - Express Request ที่มี alr_id ใน params และ { status, reason, user_id } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ส่งต่อ error ให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูล Alert หลังอัปเดตสำเร็จ
 * @throws {Error} หากไม่พบ Alert ที่ต้องการอัปเดตหรือเกิดข้อผิดพลาดระหว่างอัปเดตฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-29
 */

export async function updateAlertStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const alert_id = Number(req.params.alr_id);
        const { status, reason, user_id } = req.body;

        const updatedAlert = await AlertService.updateAlertStatus(alert_id, status, reason, user_id);

        return res.status(200).json({ message: 'Updated successfully', data: updatedAlert });
    } catch (err) {
        next(err);
    }
}