import { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras.service';

export async function list(req: Request, res: Response, next: NextFunction){
    try {
        const cameras = await CameraService.listCameras();
        res.json(cameras);
    } catch(err) {
        next(err);
    }
};
/**
 * Controller: นับรายการ Cameras ทั้งหมดที่ถูกใช้งาน
 *
 * @route GET /api/cameras/total
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการ จำนวนกล้องทั้งหมด เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการ จำนวนกล้องทั้งหมด
 *
 * @author Premsirigul
 */
export async function total(req: Request, res: Response, next: NextFunction){
    try {
        const total = await CameraService.totalCameras();
        res.json(total);
    } catch(err) {
        next(err);
    }
}