import { Request, Response, NextFunction } from "express";
import * as EventService from '../services/events.service';

/**
 * ดึงรายการเหตุการณ์ (events) ที่เปิดใช้งานทั้งหมด
 * ใช้สำหรับหน้า Event Management / ตัวเลือกในฟอร์มต่าง ๆ
 *
 * @param {Request} req - อ็อบเจ็กต์คำขอจาก Express
 * @param {Response} res - อ็อบเจ็กต์ตอบกลับจาก Express
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการเหตุการณ์ที่เปิดใช้งาน
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await EventService.getEvents();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

/**
 * ดึงรายละเอียดเหตุการณ์ (event) รายการเดียวตามรหัสที่ระบุ
 *
 * @param {Request} req - Express Request ที่มีพารามิเตอร์ evt_id
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลเหตุการณ์ที่พบ
 * @throws {Error} หากไม่พบเหตุการณ์หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getEventById(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);

        const event = await EventService.getEventById(event_id);
        return res.status(200).json({ message: 'Fetched successfully', data: event });
    } catch (err) {
        next(err);
    }
};


/**
 * สร้างเหตุการณ์ใหม่ (event) และอัปเดตการตั้งค่าการตรวจจับระดับ Global (GDS)
 *
 * @param {Request} req - Express Request ที่มี { icon_name, event_name, description, sensitivity, priority, status } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลเหตุการณ์ที่ถูกสร้างจากมุมมอง overview
 * @throws {Error} หากชื่อเหตุการณ์ซ้ำหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status
        } = req.body;
        const event = await EventService.insertEvent(
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status
        );

        return res.status(201).json({ message: 'Created successfully', data: event });
    } catch (err: any) {
        // 🚨 ตรวจ error ที่มาจาก unique constraint
        if (err.message === "Event name already exists") {
            return res.status(400).json({
                message: "Event name already exists"
            });
        }

        // ❌ ส่งต่อ error อื่น ๆ ให้ middleware ถัดไป
        next(err);
    }
};

/**
 * แก้ไขเหตุการณ์ (event) ที่มีอยู่ และอัปเดตการตั้งค่าการตรวจจับระดับ Global (GDS)
 *
 * @param {Request} req - Express Request ที่มี evt_id ใน params และฟิลด์ที่ต้องการอัปเดตใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลเหตุการณ์ที่อัปเดตสำเร็จจากมุมมอง overview
 * @throws {Error} หากชื่อเหตุการณ์ซ้ำหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);
        const {
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status
        } = req.body;
        const event = await EventService.updateEvent(
            icon_name,
            event_name,
            description,
            sensitivity,
            priority,
            status,
            event_id
        );

        return res.status(200).json({ message: 'Updated successfully', data: event });
    } catch (err: any) {
        if (err.message === "Event name already exists") {
            return res.status(400).json({
                message: "Event name already exists"
            });
        }
        next(err);
    }
};

/**
 * ลบเหตุการณ์แบบ Soft Delete (ตั้งค่าให้ไม่ใช้งาน) โดยไม่ลบข้อมูลจริง
 *
 * @param {Request} req - Express Request ที่มี evt_id ใน params
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลเหตุการณ์หลังจากถูกปิดการใช้งาน
 * @throws {Error} หากไม่พบเหตุการณ์หรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function softDeleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);

        const event = await EventService.removeEvent(event_id);

        return res.status(200).json({ message: 'Deleted successfully', data: event });
    } catch (err) {
        next(err);
    }
};

/**
 * ดึงรายการเหตุการณ์แบบภาพรวมจาก v_events_overview (เฉพาะที่ยังใช้งาน)
 *
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} รายการเหตุการณ์จากมุมมอง overview
 * @throws {Error} หากเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getGlobalEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await EventService.getGlobalEvents();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

/**
 * ดึงเหตุการณ์แบบภาพรวม (overview) รายการเดียวจาก v_events_overview ตามรหัสที่ระบุ
 *
 * @param {Request} req - Express Request ที่มี evt_id ใน params
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูลภาพรวมของเหตุการณ์ที่ค้นหา
 * @throws {Error} หากไม่พบเหตุการณ์หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function getGlobalEventById(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);

        const event = await EventService.getGlobalEventById(event_id);
        return res.status(200).json({ message: 'Fetched successfully', data: event });
    } catch (err) {
        next(err);
    }
};

/**
 * อัปเดตการตั้งค่าการตรวจจับระดับ Global (GDS) ของเหตุการณ์ที่ระบุ
 * ใช้สำหรับปรับ sensitivity, priority และ status
 *
 * @param {Request} req - Express Request ที่มี evt_id ใน params และ { sensitivity, priority, status } ใน body
 * @param {Response} res - Express Response
 * @param {NextFunction} next - ฟังก์ชันส่งต่อข้อผิดพลาดให้ middleware ถัดไป
 * @returns {Promise<Response>} ข้อมูล GDS หลังอัปเดตสำเร็จ
 * @throws {Error} หากไม่พบเหตุการณ์ที่ต้องการอัปเดตหรือเกิดข้อผิดพลาดในฐานข้อมูล
 *
 * @author Wanasart
 * @lastModified 2025-10-26
 */
export async function updateGlobalEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = Number(req.params.evt_id);
        const {
            sensitivity,
            priority,
            status
        } = req.body

        const update = await EventService.updateGlobalEvent(
            sensitivity,
            priority,
            status,
            event_id
        );
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err);
    }

}