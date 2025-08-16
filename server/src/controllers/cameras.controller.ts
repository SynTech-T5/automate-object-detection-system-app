import { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras.service';

/**
 * Controller: ดึงรายการ Cameras ทั้งหมดที่ถูกใช้งาน
 *
 * @route GET /api/cameras
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการ cameras เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการ cameras
 *
 * @author Wanasart
 */
export async function list(req: Request, res: Response, next: NextFunction){
    try {
        const cameras = await CameraService.listCameras();
        res.json(cameras);
    } catch(err) {
        next(err);
    }
}

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

/**
 * Controller: ดึงรายการประวัติการซ่อมบำรุงทั้งหมด
 *
 * @route GET /api/maintenance/history
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการประวัติการซ่อมบำรุงเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการประวัติการซ่อมบำรุง
 *
 * @author Jirayu
 * 
 */
export async function maintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const history = await CameraService.getAllMaintenanceHistory();
        return res.json(history);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: เปลี่ยนสถานะของกล้อง
 *
 * @route POST /api/cameras/change
 * @param {Request} req - Express request object (ต้องมี body ที่ประกอบด้วย id และ status)
 * @param {Response} res - Express response object (ส่งกลับกล้องที่ถูกเปลี่ยนสถานะเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของกล้องที่ถูกเปลี่ยนสถานะ
 *
 * @author Audomsak
 */
export async function change(req: Request, res: Response, next: NextFunction){
    try {
        const { id, status } = req.body; // รับ id และ status ใหม่
        console.log(id , status)

        if (isNaN(id) || isNaN(status)) {
            return res.status(400).json({ message: "id and status are required" });
        }

        const updatedCamera = await CameraService.changeStatus(id, status);
        res.json(updatedCamera);
    } catch(err) {
        next(err);
    }
};
