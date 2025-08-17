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
 * Controller: ดึงรายการ Camera Cards ทั้งหมด
 *
 * @route GET /api/cameras/cards
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับ camera cards เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ camera cards
 *
 * @author Wongsakon
 */
export async function cards(req: Request, res: Response, next: NextFunction){
    try {
        const cameras = await CameraService.cameraCards();
        res.json(cameras);
    } catch(err) {
        next(err);
    }
};
