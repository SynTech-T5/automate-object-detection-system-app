import { Request, Response, NextFunction } from "express";
import * as eventService from '../services/events.service';

/**
 * Controller: ดึงรายการ Events ทั้งหมดออกมาแสดง
 *
 * @route GET /api/events
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการ events เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการ events
 *
 * @author Jirayu
 */
export async function index(req: Request, res: Response, next: NextFunction) {
    try {
        const events = await eventService.getAllEvents();
        return res.json(events);
    } catch (err) {
        next(err);
    }
}

export async function show(req: Request, res: Response, next:NextFunction){
    try{
        const evt_id = Number(req.params.evt_id);
        const event = await eventService.getEventById(evt_id);
        return res.json(event);
    } catch (err) {
        next(err);
    }
}

/**
 * เพิ่ม Event ตามข้อมูลใน req.body
 * ส่ง Event ที่เพิ่มแล้วเป็น JSON
 *
 * @param req - Request ของ Express (body: id, icon, name, description)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Event ที่เพิ่มแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการเพิ่ม
 *
 * @author Fasai
 */
export async function store(req: Request, res: Response, next: NextFunction) {
    try {
        const { icon, name, description } = req.body;
        const createEvent = await eventService.createEvent(icon, name, description);
        return res.json(createEvent);
    } catch (err) {
        next(err);
    }
}

/**
 * อัปเดต Event ตามข้อมูลใน req.body
 * ส่ง Event ที่อัปเดตแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: id, icon, name, description)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Event ที่อัปเดตแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการอัปเดต
 *
 * @author Fasai
 */
export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const evt_id = Number(req.params.evt_id);
        const { icon, name, description } = req.body;
        const updateEvent = await eventService.updateEvent(evt_id, icon, name, description);
        return res.json(updateEvent);
    } catch (err) {
        next(err);
    }
}

/**
 * ลบ Event ตามข้อมูลใน req.body
 * ส่ง Event ที่ลบแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: id, status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ Event ที่ลบแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการลบ
 *
 * @author Fasai
 */
export async function softDelete(req: Request, res: Response, next: NextFunction) {
    try {
        const evt_id = Number(req.params.evt_id);
        const { status } = req.body
        const deleteEvent = await eventService.deleteEvent(evt_id, status);
        return res.json(deleteEvent);
    } catch (err) {
        next(err);
    }
}