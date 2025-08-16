import { Request, Response, NextFunction } from 'express';
import * as maintenanceService from '../services/maintenance.service';


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
 */
export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const history = await maintenanceService.getAllMaintenanceHistory();
        return res.json(history);
    } catch (err) {
        next(err);
    }
}