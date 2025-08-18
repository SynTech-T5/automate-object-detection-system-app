import { Request, Response, NextFunction } from 'express';
import * as CameraService from '../services/cameras.service';

export async function list(req: Request, res: Response, next: NextFunction) { //show All cameras สร้างมาเทสไม่เกี่ยว 
  try {
    const cameras = await CameraService.listCameras();
    res.json(cameras);
  } catch (err) {
    next(err);
  }
};


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