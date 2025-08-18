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
 * Controller: ดึงข้อมูลการควบคุมสิทธิ์การเข้าถึงของกล้องตาม cam_id
 *
 * @route GET /api/cameras/:cam_id/access-control
 * @param {Request} req - Express request object (ต้องมี params: cam_id)
 * @param {Response} res - Express response object (ส่งกลับข้อมูล access control ของกล้องที่เลือกเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของการควบคุมสิทธิ์กล้อง (access control)
 *
 * @author Jirayu
 */
export async function getAccessControlById(req: Request, res: Response, next: NextFunction) {
    try {
        const cam_id = Number(req.params.cam_id); 
        const cameraAccess = await CameraService.showCameraAccessControlById(cam_id);
        return res.json(cameraAccess);
    } catch (error) {
        next(error);
    }
}

/**
 * Controller: ดึงข้อมูลการควบคุมสิทธิ์การเข้าถึงของกล้องทั้งหมด
 *
 * @route GET /api/cameras/access-control
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับข้อมูล access control ของกล้องทั้งหมดเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของการควบคุมสิทธิ์กล้องทั้งหมด
 *
 * @author Jirayu
 */
export async function getAccessControl(req: Request, res: Response, next: NextFunction) {
    try {
        const cameraAccess = await CameraService.showCameraAccessControl();
        return res.json(cameraAccess);
    } catch (error) {
        next(error);
    }
}
