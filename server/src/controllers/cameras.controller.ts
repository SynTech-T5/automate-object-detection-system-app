import e, { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras/cameras.service';
import * as MaintenanceService from '../services/cameras/maintenances.service';
import * as EventDetectionService from '../services/cameras/eventDetections.service';
import * as AccessControlService from '../services/cameras/accessControl.service';
import * as LocationService from '../services/cameras/location.service';
import * as PerformanceService from '../services/cameras/performance.service';
import { ffmpegService } from '../services/cameras/ffmpeg.service';

/* ------------------------------ Cameras ------------------------------ */

/**✅
 * ดึงข้อมูลกล้องทั้งหมดในระบบ
 * ใช้สำหรับแสดงรายการกล้องทุกตัวในระบบ รวมถึงรายละเอียดพื้นฐาน เช่น ชื่อ ประเภท สถานะ แหล่งข้อมูล และตำแหน่งที่ตั้ง
 * 
 * @param {Request} req - Request ที่ใช้เรียก API เพื่อดึงข้อมูลกล้องทั้งหมด
 * @param {Response} res - Response สำหรับส่งข้อมูลรายการกล้องกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีรายการข้อมูลกล้องทั้งหมด
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูลหรือ service layer
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getCameras(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await CameraService.getCameras();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

/**✅
 * ดึงข้อมูลรายละเอียดของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงข้อมูลกล้องเฉพาะตัว เช่น ชื่อ ประเภท สถานะ ตำแหน่ง และแหล่งที่มา
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลกล้องและข้อความสถานะ
 * @throws {Error} ถ้าไม่พบกล้องตามรหัสที่ระบุ หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getCameraById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const camera = await CameraService.getCameraById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: camera });
    } catch (err) {
        next(err);
    }
};

/**✅
 * ดึงข้อมูลสรุปภาพรวมของกล้องทั้งหมดในระบบ
 * ใช้สำหรับแสดงข้อมูลเชิงสถิติ เช่น จำนวนกล้องที่เปิดใช้งาน ปิดใช้งาน หรือจำนวนทั้งหมด
 * 
 * @param {Request} req - Request ที่รับข้อมูลการเรียกใช้งาน
 * @param {Response} res - Response สำหรับส่งข้อมูลสรุปกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลสรุปกล้องและข้อความสถานะ
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูลหรือ service layer
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getSummaryCameras(req: Request, res: Response, next: NextFunction) {
    try {
        const summary = await CameraService.summaryCameras();
        return res.status(200).json({ message: 'Fetched successfully', data: summary });
    } catch (err) {
        next(err);
    }
};

/**✅
 * เพิ่มข้อมูลกล้องใหม่เข้าสู่ระบบ
 * ใช้สำหรับสร้างรายการกล้องใหม่พร้อมรายละเอียด เช่น ประเภท สถานะ แหล่งข้อมูล และตำแหน่งที่ตั้ง
 * 
 * @param {Request} req - Request ที่มีข้อมูลใน body (camera_name, camera_type, camera_status, source_type, source_value, location_id, description, creator_id)
 * @param {Response} res - Response สำหรับส่งข้อมูลกล้องที่ถูกสร้างใหม่กลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของกล้องที่ถูกสร้างใหม่
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการเพิ่มข้อมูลลงฐานข้อมูล หรือข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function createCamera(req: Request, res: Response, next: NextFunction) { 
    try {
        const { 
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description, 
            creator_id 
        } = req.body

        const create = await CameraService.insertCamera(
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description, 
            creator_id
        );
        return res.status(201).json({ message: 'Created successfully', data: create });
    } catch (err) {
        next(err);
    }
}

/**✅
 * อัปเดตข้อมูลกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขรายละเอียดของกล้อง เช่น ชื่อ ประเภท สถานะ แหล่งข้อมูล ตำแหน่งที่ตั้ง และคำอธิบาย
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id และข้อมูลใน body (camera_name, camera_type, camera_status, source_type, source_value, location_id, description)
 * @param {Response} res - Response สำหรับส่งข้อมูลกล้องที่อัปเดตแล้วกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับจัดการ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของกล้องที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function updateCamera(req: Request, res: Response, next: NextFunction) { //update camera
    try {
        const camera_id = Number(req.params.cam_id);
        const { 
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description,
            user_id,
        } = req.body

        const update = await CameraService.updateCamera(
            camera_id,
            camera_name, 
            camera_type, 
            camera_status, 
            source_type, 
            source_value, 
            location_id, 
            description,
            user_id
        );
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err);
    }
    
}

/**✅
 * ลบข้อมูลกล้องแบบ Soft Delete ตามรหัสที่ระบุ
 * โดยจะเปลี่ยนสถานะ cam_is_use เป็น false และอัปเดตเวลาแก้ไขล่าสุด โดยไม่ลบข้อมูลจริงออกจากฐานข้อมูล
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสของกล้อง)
 * @param {Response} res - Response สำหรับส่งผลการลบกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของกล้องที่ถูกลบ (soft delete)
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการลบ หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function softDeleteCamera(req: Request, res: Response, next: NextFunction) { //soft delete
    try {
        const camera_id = Number(req.params.cam_id);
        const softDelete = await CameraService.removeCamera(camera_id);

        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
        next(err);
    }
}

/* ------------------------------ Maintenances History ------------------------------ */

/**✅
 * ดึงข้อมูลประวัติการบำรุงรักษาของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงรายการบำรุงรักษาทั้งหมดของกล้องแต่ละตัว
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีรายการบำรุงรักษาของกล้อง
 * @throws {Error} ถ้าไม่พบข้อมูลการบำรุงรักษาหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function getMaintenanceByCameraId(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const list = await MaintenanceService.getMaintenanceByCameraId(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
            next(err);
    }
}

/**✅
 * เพิ่มข้อมูลประวัติการบำรุงรักษาใหม่ให้กับกล้องที่ระบุ
 * ใช้สำหรับบันทึกการซ่อม การตรวจเช็ก หรือการบำรุงรักษาในแต่ละครั้ง
 * 
 * @param {Request} req - Request ที่มีข้อมูลใน body (technician, type, date, note)
 * @param {Response} res - Response สำหรับส่งผลการสร้างกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของรายการบำรุงรักษาที่ถูกสร้างใหม่
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการเพิ่มข้อมูลลงฐานข้อมูลหรือข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function createMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);
        const {
            technician,
            type,
            date,
            note
        } = req.body;

        const create = await MaintenanceService.insertMaintenance(camera_id, technician, type, date, note);
        return res.status(201).json({ message: 'Created successfully', data: create });
    } catch (err) {
            next(err);
    }
}

/**✅
 * อัปเดตรายการบำรุงรักษาตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขข้อมูล เช่น วันที่ ประเภท ช่างเทคนิค หรือหมายเหตุของการบำรุงรักษา
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ mnt_id และข้อมูลใน body (technician, type, date, note)
 * @param {Response} res - Response สำหรับส่งข้อมูลที่อัปเดตกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของรายการบำรุงรักษาหลังการอัปเดต
 * @throws {Error} ถ้าไม่พบรายการบำรุงรักษาหรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function updateMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const maintenance_id = Number(req.params.mnt_id);
        const {
            technician,
            type,
            date,
            note
        } = req.body;

        const update = await MaintenanceService.updateMaintenance(maintenance_id, technician, type, date, note);
        return res.status(201).json({ message: 'Updated successfully', data: update });
    } catch (err) {
            next(err);
    }
}

/**✅
 * ลบข้อมูลการบำรุงรักษาแบบ Soft Delete ตามรหัสที่ระบุ
 * โดยจะตั้งค่า mnt_is_use เป็น false และอัปเดตเวลาแก้ไขล่าสุด โดยไม่ลบข้อมูลจริงออกจากฐานข้อมูล
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ mnt_id (รหัสรายการบำรุงรักษา)
 * @param {Response} res - Response สำหรับส่งผลการลบกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของรายการบำรุงรักษาที่ถูกลบ (soft delete)
 * @throws {Error} ถ้าไม่พบรายการบำรุงรักษาหรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function softDeleteMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const maintenance_id = Number(req.params.mnt_id);

        const softDelete = await MaintenanceService.removeMaintenance(maintenance_id);
        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
            next(err);
    }
}

/* ------------------------------ Event Detection ------------------------------ */

/**✅
 * ดึงข้อมูลการตั้งค่าการตรวจจับเหตุการณ์ (Event Detection) ของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแสดงรายละเอียดเหตุการณ์ที่กล้องสามารถตรวจจับได้ รวมถึงระดับความไว (sensitivity) ลำดับความสำคัญ (priority) และสถานะการทำงาน
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลการตั้งค่าการตรวจจับเหตุการณ์กลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีรายการการตั้งค่าการตรวจจับเหตุการณ์ของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลการตั้งค่าการตรวจจับเหตุการณ์ หรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function getEventDetectionById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const eventDetection = await EventDetectionService.getEventDetectionById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: eventDetection });
    } catch (err) {
        next(err);
    }
}

/**✅
 * อัปเดตการตั้งค่าการตรวจจับเหตุการณ์ (Event Detection) ตามรหัสที่ระบุ
 * ใช้สำหรับปรับค่าการตรวจจับ เช่น ความไว (sensitivity), ลำดับความสำคัญ (priority) และสถานะการทำงานของเหตุการณ์
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cds_id และข้อมูลใน body (detection_sensitivity, detection_priority, detection_status)
 * @param {Response} res - Response สำหรับส่งข้อมูลการตั้งค่าที่อัปเดตกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลของการตั้งค่าการตรวจจับเหตุการณ์ที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบรายการที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-12
 */
export async function updateEventDetection(req: Request, res: Response, next: NextFunction) {
    try {
        const detection_id = Number(req.params.cds_id);
        const { 
            detection_sensitivity, 
            detection_priority, 
            detection_status
        } = req.body;

        const updateEventDetection = await EventDetectionService.updateEventDetection(
            detection_sensitivity, 
            detection_priority, 
            detection_status, 
            detection_id
        );
        return res.status(200).json({ message: 'Updated successfully', data: updateEventDetection });
    } catch (err) {
        next(err);
    }
}

/* ------------------------------ Access Control ------------------------------ */

/**✅
 * ดึงข้อมูลสิทธิ์การเข้าถึงของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับตรวจสอบการตั้งค่าการเข้าถึงของกล้อง เช่น การยืนยันตัวตน การจำกัดสิทธิ์ และการบันทึกการเข้าถึง
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสของกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลสิทธิ์การเข้าถึงกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลสิทธิ์การเข้าถึงของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลสิทธิ์การเข้าถึงหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function getPermissionByCameraId(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const list = await AccessControlService.getPermissionByCameraId(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err)
    }
}

/**✅
 * อัปเดตการตั้งค่าสิทธิ์การเข้าถึงของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับแก้ไขการตั้งค่าการเข้าถึง เช่น การยืนยันตัวตน การจำกัดสิทธิ์การเข้าถึง และการบันทึกการเข้าถึงของผู้ใช้
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id และข้อมูลใน body (require_auth, restrict, log)
 * @param {Response} res - Response สำหรับส่งข้อมูลสิทธิ์การเข้าถึงที่อัปเดตกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลสิทธิ์การเข้าถึงของกล้องที่ถูกอัปเดต
 * @throws {Error} ถ้าไม่พบกล้องที่ต้องการอัปเดต หรือเกิดข้อผิดพลาดระหว่างการอัปเดตฐานข้อมูล
 * 
 * @author Wanasart
 * @lastModified 2025-10-17
 */
export async function updatePermission(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);
        const {
            require_auth,
            restrict,
            log
        } = req.body;

        const update = await AccessControlService.updatePermission(camera_id, require_auth, restrict, log);
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err)
    }
}

/* ------------------------------ Performance ------------------------------ */

/**✅
 * ดึงข้อมูลประสิทธิภาพการทำงานของกล้องทั้งหมดประจำวัน
 * ใช้สำหรับแสดงสถิติการทำงานของกล้องทุกตัว เช่น เวลาทำงาน การเชื่อมต่อ และสถานะการทำงานปัจจุบัน
 * 
 * @param {Request} req - Request ที่รับการเรียกใช้งาน API
 * @param {Response} res - Response สำหรับส่งข้อมูลประสิทธิภาพของกล้องทั้งหมดกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลประสิทธิภาพของกล้องทั้งหมด
 * @throws {Error} ถ้าเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูลหรือ service layer
 * 
 * @author Fasai
 * @lastModified 2025-10-16
 */
export async function getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await PerformanceService.getPerformance();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err)
    }
}

/**✅
 * ดึงข้อมูลประสิทธิภาพการทำงานของกล้องตามรหัสที่ระบุ
 * ใช้สำหรับตรวจสอบข้อมูลการทำงานเฉพาะของกล้อง เช่น เวลาการทำงาน การตอบสนอง และสถานะล่าสุดของกล้อง
 * 
 * @param {Request} req - Request ที่มีพารามิเตอร์ cam_id (รหัสของกล้อง)
 * @param {Response} res - Response สำหรับส่งข้อมูลประสิทธิภาพของกล้องกลับไปยัง client
 * @param {NextFunction} next - Middleware สำหรับส่งต่อ error หากเกิดข้อผิดพลาด
 * @returns {Promise<Response>} คืนค่า response ที่มีข้อมูลประสิทธิภาพของกล้องที่ระบุ
 * @throws {Error} ถ้าไม่พบข้อมูลของกล้องหรือเกิดข้อผิดพลาดระหว่างการดึงข้อมูลจากฐานข้อมูล
 * 
 * @author Fasai
 * @lastModified 2025-10-16
 */
export async function getPerformanceById(req: Request, res: Response, next: NextFunction) {
    try {
        const camera_id = Number(req.params.cam_id);

        const performance = await PerformanceService.getPerformanceById(camera_id);
        return res.status(200).json({ message: 'Fetched successfully', data: performance });
    } catch (err) {
        next(err)
    }
}

/* ------------------------------ Location  ------------------------------ */

export async function getLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LocationService.getLocation();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err)
    }
}

export async function createLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            location_name
        } = req.body;

        const create = await LocationService.insertLocation(location_name);
        return res.status(201).json({ message: 'Created successfully', data: create });
    } catch (err) {
        next(err)
    }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const location_id = Number(req.params.loc_id);
        const {
            location_name
        } = req.body;

        const update = await LocationService.updateLocation(location_id, location_name);
        return res.status(200).json({ message: 'Updated successfully', data: update });
    } catch (err) {
        next(err)
    }
}

export async function softDeleteLocation(req: Request, res: Response, next: NextFunction) {
    try {
        const location_id = Number(req.params.loc_id);

        const softDelete = await LocationService.removeLocation(location_id);
        return res.status(200).json({ message: 'Deleted successfully', data: softDelete });
    } catch (err) {
        next(err)
    }
}

/* ------------------------------ Streamimg ------------------------------ */
export function rtspToWhep(rtspUrl: string, webrtcBase = 'http://localhost:8889') {
    // rtsp://user:pass@host:8003/<path>
    const m = rtspUrl.match(/^rtsp:\/\/([^@]*@)?[^/]+\/(.+)$/i);
    const path = m?.[2] ?? ''; // เช่น 'city-traffic'
    if (!path) throw new Error('Invalid RTSP url, no path');

    // ถ้าต้อง auth (readUser/readPass) ให้แนบ Basic Auth
    // ในงานจริง แนะนำซ่อนไว้หลัง API/Token ของคุณ
    const authHeader = (rtspUrl.includes('viewer:viewpass@'))
        ? 'Basic ' + Buffer.from('viewer:viewpass').toString('base64')
        : undefined;

    return {
        whepUrl: `${webrtcBase.replace(/\/+$/, '')}/whep/${encodeURIComponent(path)}`,
        authHeader,
    };
}

// export async function streamCamera(req: Request, res: Response) {
//     try {
//         const camId = Number(req.params.cam_id);
//         if (!camId) return res.status(400).send("cam_id required");

//         const cam = await CameraService.getCameraById(camId);
//         if (!cam) return res.status(404).send("Camera not found");

//         const rtspUrl = String(cam.address);
//         rtspToWhep(rtspUrl);

//         // const finalUrl = normalizeForHost(rtspUrl);
//         const finalUrl = rtspUrl;

//         const forceEncode = req.query.encode === "1"; // ?encode=1 จะบังคับ x264
//         ffmpegService.startStream(res, finalUrl, { forceEncode });
//     } catch (err: any) {
//         const status = err?.status ?? 500;
//         const msg = err?.message ?? "Failed to stream camera";
//         console.error("stream error:", err);
//         if (!res.headersSent) res.status(status).json({ error: msg });
//     }
// }