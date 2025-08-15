import { Request, Response, NextFunction } from "express";
import * as AlertService from "../services/alerts.service";

/**
 * Controller: ดึงรายการ Alerts ทั้งหมดที่ถูกใช้งาน
 *
 * @route GET /api/alerts
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับรายการ alerts เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของรายการ alerts
 *
 * @author Wanasart
 */
export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const alerts = await AlertService.getAlertList();
        res.json(alerts);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึง log ของ Alert ตาม alert ID ที่ส่งมา
 *
 * @route GET /api/alerts/:alr_id/logs
 * @param {Request} req - Express request object (ต้องมี params.alr_id)
 * @param {Response} res - Express response object (ส่งกลับ log ของ alert เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ log alerts
 *
 * @author Wanasart
 */
export async function logs(req: Request, res: Response, next: NextFunction) {
    try {
        const alr_id = Number(req.params.alr_id);
        if (isNaN(alr_id)) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }
        const logAlerts = await AlertService.getAlertLogs(alr_id);
        res.json(logAlerts);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึง alerts ที่เกี่ยวข้องกับ Event ที่กำหนด
 *
 * @route GET /api/events/:evt_id/alerts
 * @param {Request} req - Express request object (ต้องมี params.evt_id)
 * @param {Response} res - Express response object (ส่งกลับ related alerts เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ related alerts
 *
 * @author Wanasart
 */
export async function related(req: Request, res: Response, next: NextFunction) {
    try {
        const evt_id = Number(req.params.evt_id);
        if (isNaN(evt_id)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }
        const relatedAlerts = await AlertService.getAlertRelated(evt_id);
        res.json(relatedAlerts);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงรายการ Note ของ Alert ตาม alert ID ที่ส่งมา
 *
 * @route GET /api/alerts/:alr_id/notes
 * @param {Request} req - Express request object (ต้องมี params.alr_id)
 * @param {Response} res - Express response object (ส่งกลับ notes ของ alert เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ alert notes
 *
 * @author Wanasart
 */
export async function notes(req: Request, res: Response, next: NextFunction) {
    try {
        const alr_id = Number(req.params.alr_id);
        if (isNaN(alr_id)) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }
        const notes = await AlertService.getAlertNotes(alr_id);
        res.json(notes);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงข้อมูลแนวโน้มของ Alert ในช่วงวันที่กำหนด
 *
 * @route GET /api/alerts/:days_back/trend
 * @param {Request} req - Express request object (ต้องมี query parameter days_back)
 * @param {Response} res - Express response object (ส่งกลับข้อมูลแนวโน้มเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของแนวโน้ม alert
 *
 * @author Wanasart
 */
export async function trend(req: Request, res: Response, next: NextFunction) {
    try {
        const days_back = Number(req.params.days_back);
        if (isNaN(days_back)) {
            return res.status(400).json({ error: "Missing days_back query parameter" });
        }

        const trendData = await AlertService.getAlertTrend(days_back);
        res.json(trendData);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงข้อมูลการกระจายของ Alert ตามประเภทเหตุการณ์
 *
 * @route GET /api/alerts/distribution
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับข้อมูลการกระจายเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของการกระจาย alert
 *
 * @author Wanasart
 */
export async function distribution(req: Request, res: Response, next: NextFunction){
    try {
        const distributionData = await AlertService.getAlertByEventType();
        return res.json(distributionData);
    } catch (err){
        next(err);
    }
}