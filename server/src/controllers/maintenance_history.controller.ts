import { Request, Response, NextFunction } from "express";
import * as MaintenanceHistoryService from "../services/maintenance_history.service";

/**
 * Controller: สร้าง Maintenance History ใหม่
 *
 * @route POST /api/maintenance_history/:cam_id/create
 * @param {Request} req - Express request object (body: { date, type, technician, note })
 * @param {Response} res - Express response object (ส่งกลับ Maintenance History ที่สร้างใหม่เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ Maintenance History  ที่สร้างใหม่
 *
 * @author Napat
 */
export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const { date, type, technician, note } = req.body;
        const camId = Number(req.params.cam_id);
        const createHistory = await MaintenanceHistoryService.createMaintenanceHistory(camId, date, type, technician, note);
        res.json(createHistory);
    } catch (err) {
        next(err);
    }
}