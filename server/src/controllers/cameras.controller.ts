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
 * Controller: แก้ไขข้อมูลกล้อง
 * @route POST /api/cameras/update/:id
 * @param req -กรอกข้อมูลของกล้องทั้งหมดตามฟิลด์
 * @param res ส่งข้อมูลของกล้องกลับ
 * @returns -JSON response ส่งข้อมูลของกล้องที่แก้ไขกลับพร้อมแสดงสถานะ 200
 * @author Chokchai
 */
export async function update(req: Request, res: Response, next: NextFunction) { //update camera
  const id = Number(req.params.id);
  const updated = await CameraService.updateCamera(id, req.body);
  if (!updated) {
    // ไม่พบ id หรือไม่มีฟิลด์ให้อัปเดต
    return res.status(404).json({ message: 'camera not found or no fields to update' });
  }
  return res.status(200).json(updated);
}

/**
 * Controller: ลบข้อมูลกล้องแบบ softdelete
 * @route POST /api/cameras/create
 * @param req -กรอกข้อมูลของกล้องทั้งหมดตามฟิลด์
 * @param res ส่งข้อมูลของกล้องกลับ
 * @returns -JSON response แสดงสถานะ 202
 * @author Chokchai
 */
export async function remove(req: Request, res: Response, next: NextFunction) { //soft delete
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: 'id must be a number' });
  }
  const deleteid = await CameraService.deleteCamera(id);
  if (!deleteid) return res.status(404).json({ message: 'camera not found' });
  return res.status(202).send();
}
 
/**
 * Controller: ค้นหากล้อง
 * @route POST /api/cameras/find/:term
 * @param req -กรอกข้อมูลของกล้องมี id ชื่อกล้อง สถานที่กล้อง 
 * @param res ส่งข้อมูลกล้องกลับมา
 * @param next ส่งต่อ error
 * @returns -JSON response ส่งข้อมูลของกล้องที่ค้นหากลับ
 * @author Chokchai
 */
export async function find(req: Request, res: Response, next: NextFunction) { //ค้นหากล้อง 
  try {
    const term = decodeURIComponent(req.params.term || '').trim();

    if (!term) return res.status(400).json({ message: 'term required' });

    const id = Number(term);
    const byId = Number.isFinite(id);

    // ถ้า term เป็นตัวเลขล้วน → ค้นด้วย cam_id
    // ถ้าไม่ใช่ตัวเลข → ค้นด้วยชื่อกล้อง (cam_name) OR ชื่อสถานที่ (loc_name)
    type FindCameraParams = { id?: number; name?: string; location?: string }; //กำหนด type

    const args: FindCameraParams = {}; //สร้าง object ว่าง ๆ ไว้
    if (byId) {
      args.id = id;
    } else {
      args.name = term;
      args.location = term;
    }

    const rows = await CameraService.findCameras(args);

    return res.json(rows);
    
  } catch (e) {
    next(e);
  }
}

/**
 * Controller: เพิ่มกล้องใหม่
 * @route POST /api/cameras/create
 * @param req -กรอกข้อมูลของกล้องทั้งหมดตามฟิลด์
 * @param res ส่งข้อมูลของกล้องกลับ
 * @param next ส่งต่อ error
 * @returns -JSON response ส่งข้อมูลของกล้องที่สร้างกลับพร้อมแสดงสถานะ 201
 * @author Chokchai
 */
export async function create(req: Request, res: Response, next: NextFunction) { //create camera
  try {
    const created = await CameraService.createCameras(req.body);
    return res.status(201).json(created);
  } catch (err) {
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
export async function createMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
        const { date, type, technician, note } = req.body;
        const camId = Number(req.params.cam_id);
        const createHistory = await CameraService.createMaintenanceHistory(camId, date, type, technician, note);
        res.json(createHistory);
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
        const {cam_id} = req.params;
        const {status} = req.body;

        const id = Number(cam_id);

        if (isNaN(id) || isNaN(status)) {
            return res.status(400).json({ message: "id and status are required" });
        }

        const updatedCamera = await CameraService.changeStatus(id, status);

        res.json(updatedCamera);
    } catch(err) {
        next(err);
    }
};

/**
 * Controller: ดึงรายการ Event Detection 
 *
 * @route GET /api/:cam_id/event-detection
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (ส่งกลับ event detections เป็น JSON)
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} JSON response ของ event detections
 *
 * @author Wongsakon
 */
export async function listEventDetection(req: Request, res: Response, next: NextFunction){
    try {
        const eventDetection = await CameraService.eventDetection();
        res.json(eventDetection);
    } catch(err) {
        next(err);
    }
}


/**
 * อัปเดต Event Detection
 *
 * @route PUT /api/events/:cds_id/update/event-detection
 * @param req - Request ของ Express (params: cds_id, body: cds_sensitivity, cds_priority, cds_status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error ไปยัง error handler
 * @returns {Promise<Response>} JSON response ของ Event Detection ที่อัปเดตแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการอัปเดต
 * 
 * @author Wongsakon
 */
export async function updateEventDetection(req: Request, res: Response, next: NextFunction) {
    try {
      const cds_id = Number(req.params.cds_id);
      const { cds_sensitivity, cds_priority, cds_status } = req.body;
      const updated = await CameraService.updateEventDetection(cds_id, cds_sensitivity, cds_priority, cds_status);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
}

/**
 * สร้าง Event Detect 
 *
 *  
 * @route POST /api/events/createDetect
 * @param req - Request ของ Express (body: cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ EventDetect ที่สร้างขึ้นใหม่
 *
 * @author Audomsak
 */
export async function createEventDetection(req: Request, res: Response, next: NextFunction){
    try{
        const { cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status } = req.body;        
        const createEventDetection = await CameraService.createEventDetection( cds_event_id, cds_camera_id, cds_sensitivity, cds_priority, cds_status);
        return res.json(createEventDetection);
    }catch (err){
         next(err);
    }
}

/**
 * ลบ EventDetect ตามข้อมูลใน req.body
 * ส่ง EventDetect ที่ลบแล้วกลับเป็น JSON
 *
 * @param req - Request ของ Express (body: id, status)
 * @param res - Response ของ Express
 * @param next - ส่งต่อ error
 * @returns {Promise<Response>} JSON response ของ EventDetect ที่ลบแล้ว
 *
 * @throws Error หากเกิดข้อผิดพลาดระหว่างการลบ
 *
 * @author Audomsak
 */
export async function softDeleteEventDetect(req: Request, res: Response, next: NextFunction) {
    try{
        const id = Number(req.params.cds_id);

        const { status } = req.body
        const deleteEventDetection = await CameraService.deleteEventDetection( id, status);
        return res.json(deleteEventDetection);
    }catch(err){
        next(err);
    }
}


