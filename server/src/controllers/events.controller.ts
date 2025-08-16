import { Request, Response, NextFunction } from "express";
import * as eventService from '../services/events.service';

/**
 * Controller: สร้าง Event ใหม่
 *
 * @route POST /api/events
 * @param {Request} req - Express request object (ต้องมี body ที่ประกอบด้วย icon, name, description)
 * @param {Response} res - Express response object (ส่งกลับ event ที่ถูกสร้างเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ event ที่ถูกสร้าง
 *
 * @author Fasai
 */
export async function create(req: Request, res: Response, next: NextFunction){
    try{
        const { icon, name, description } = req.body;
        const createEvent = await eventService.createEvent(icon, name, description);
        return res.json(createEvent);
    }catch (err){
         next(err);
    }
}

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
export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const events = await eventService.getAllEvents();
        return res.json(events);
    } catch (err) {
        next(err);
    }
}