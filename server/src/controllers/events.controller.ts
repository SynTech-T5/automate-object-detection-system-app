import { Request, Response, NextFunction } from "express";
import * as eventService from '../services/events.service';

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

export async function create(req: Request, res: Response, next: NextFunction){
    try{
        const { icon, name, description } = req.body;
        const createEvent = await eventService.createEvent(icon, name, description);
        return res.json(createEvent);
    }catch (err){
         next(err);
    }
}