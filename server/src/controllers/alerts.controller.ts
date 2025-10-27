import { Request, Response, NextFunction } from "express";
import * as AlertService from "../services/alerts.service";


// ✅
export async function getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await AlertService.getAlerts();
        
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
}

// ✅
export async function createAlert(req: Request, res: Response, next: NextFunction) {
    try {
        const { 
            user_id, 
            camera_id, 
            footage_id, 
            event_id, 
            severity, 
            description 
        } = req.body;

        const alert = await AlertService.insertAlert(
            user_id, 
            camera_id, 
            footage_id, 
            event_id, 
            severity, 
            description
        );
        
        return res.status(201).json({ message: 'Created successfully', data: alert });
    } catch (err) {
        next(err);
    }
}

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
export async function index(req: Request, res: Response, next: NextFunction) {
    try {
        const alerts = await AlertService.getAlertList();
        res.json(alerts);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ดึงสถานะของ Alerts ทั้งหมด
 *
 * @route GET /api/alerts/status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับสถานะ alerts เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของสถานะ alerts
 *
 * @author Wanasart
 */
export async function status(req: Request, res: Response, next: NextFunction) {
    try {
        const cameras = await AlertService.countStatusAlerts();
        res.json(cameras);
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
export async function indexLogs(req: Request, res: Response, next: NextFunction) {
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
export async function indexByEvent(req: Request, res: Response, next: NextFunction) {
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
export async function indexNotes(req: Request, res: Response, next: NextFunction) {
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
export async function trendAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
        // const days_back = Number(req.params.days_back);
        // if (isNaN(days_back)) {
        //     return res.status(400).json({ error: "Missing days_back query parameter" });
        // }

        const trendData = await AlertService.getAlertTrend();
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
export async function distributionAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
        const distributionData = await AlertService.getAlertByEventType();
        return res.json(distributionData);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: สร้าง Alert ใหม่
 *
 * @route POST /api/alerts
 * @param {Request} req - Express request object (body: { severity, camera_id, footage_id, event_id, description })
 * @param {Response} res - Express response object (ส่งกลับ Alert ที่สร้างใหม่เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ Alert ที่สร้างใหม่
 *
 * @author Wanasart
 */
export async function store(req: Request, res: Response, next: NextFunction) {
    try {
        const { severity, camera_id, footage_id, event_id, description } = req.body;
        if (!severity || !camera_id || !footage_id || !event_id ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newAlert = await AlertService.createAlert(severity, camera_id, footage_id, event_id, description);
        res.status(201).json(newAlert);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: อัปเดตสถานะของ Alert
 *
 * @route POST /api/alerts/:alr_id/update
 * @param {Request} req - Express request object (params: { alr_id }, body: { status })
 * @param {Response} res - Express response object (ส่งกลับ Alert ที่อัปเดตเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ Alert ที่อัปเดต
 *
 * @author Wanasart
 */
export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const { alr_id } = req.params;
        const { status } = req.body;

        if (!alr_id || isNaN(Number(alr_id))) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }

        if (!status || !['Resolved', 'Dismissed'].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be 'Resolved' or 'Dismissed'" });
        }

        const updatedAlert = await AlertService.updateAlert(Number(alr_id), status);
        res.json(updatedAlert);
    } catch (err) {
        next(err);
    }
}

/**
 * Controller: ลบ Alert โดยการอัปเดตสถานะเป็น false
 *
 * @route DELETE /api/alerts/:alr_id
 * @param {Request} req - Express request object (params: { alr_id })
 * @param {Response} res - Express response object (ส่งกลับ Alert ที่ถูกลบเป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ Alert ที่ถูกลบ
 *
 * @author Wanasart
 */
export async function softDelete(req: Request, res: Response, next: NextFunction){
    try {
        const { alr_id } = req.params;
        if (!alr_id || isNaN(Number(alr_id))) {
            return res.status(400).json({ error: "Invalid alert ID" });
        }

        const deletedAlert = await AlertService.deleteAlert(Number(alr_id));
        res.json(deletedAlert);
    } catch (err) {
        next(err);
    }
}