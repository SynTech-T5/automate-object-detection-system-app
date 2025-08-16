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
 * Controller: ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *
 * @route GET /api/cameras/maintenance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการประวัติการซ่อมบำรุงเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการประวัติการซ่อมบำรุง
 *
 * @author Jirayu
 * 
 *
 */
export async function listMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const history = await CameraService.getAllMaintenanceHistory();
        return res.json(history);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงรายการประวัติการซ่อมบำรุงตามรหัสกล้อง
 *
 * @route GET /api/cameras/:cam_id/maintenance
 * @param {Request} req - Express request object (ต้องมี params.cam_id)
 * @param {Response} res - Express response object (ส่งกลับรายการประวัติการซ่อมบำรุงเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการประวัติการซ่อมบำรุง
 *
 * @author Jirayu
 */
export async function listMaintenanceByCamId(req: Request, res: Response, next: NextFunction) {
    try {
        const cam_id = Number(req.params.cam_id);
        if (isNaN(cam_id)) {
            return res.status(400).json({ error: "Invalid camera ID" });
        }
        const history = await CameraService.getMaintenanceHistoryByCamId(cam_id);
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
