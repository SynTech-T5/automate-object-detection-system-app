/**
 * Cameras Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการจัดการกล้อง (Cameras):
 *  - GET /api/cameras                                  → ดึงรายการกล้องทั้งหมด
 *  - GET /api/cameras/total                            → ดึงจำนวนกล้องทั้งหมด
 *  - GET /api/cameras/total-inactive                   → ดึงจำนวนกล้องที่ไม่ได้ใช้งานทั้งหมด
 *  - GET /api/cameras/update/:cam_id                   → แก้ไขข้อมูลกล้องผ่าน cam_id
 *  - DELETE /api/cameras/delete/:cam_id                → ลบกล้องผ่าน cam_id
 *  - GET /api/cameras/find/:term                       → ค้นหากล้องทั้งหมดผ่าน id ชื่อกล้อง สถานที่กล้อง
 *  - POST /api/cameras/create                          → เพิ่มกล้องใหม่
 *  - GET /api/cameras/:cam_id/maintenance              → ดึงข้อมูลการบำรุงรักษาของกล้องตาม cam_id
 *  - GET /api/cameras/maintenance                      → ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *  - POST /api/cameras/:cam_id/maintenance/create      → สร้าง Maintenance History ใหม่
 *  - PATCH /api/cameras/:cam_id/maintenance/delete     → ลบ Maintenance History
 *  - PUT /api/cameras/:cam_id/maintenance/update       → อัพเดท Maintenance History
 *  - GET /api/cameras/event-detection                  → ดึงรายการ EventDetection ทั้งหมด
 *  - POST /api/events/createDetect                     → สร้าง EventDetect 
 *  - PUT /api/cameras/event-detection/:cds_id/update   → แก้ไข EventDetection ที่เลือก
 *  - PATCH /api/cameras/:cam_id                        → update status กล้องตาม cam_id
 *  - PATCH /api/events/:cds_id/deleteDetect            → ลบ EventDetection ที่เลือกโดยการเปลี่ยนสถานะแทนการลบจริง
 *  - PATCH /api/cameras/:cam_id/access                 → อัพเดท Access Control
 *
 * @module routes/cameras
 * @requires express
 * @requires controllers/cameras.controller
 *
 * @author Wanasart
 * @author Chokchai
 * @created 2025-08-16
 * @lastModified 2025-08-17
 */
import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

// Cameras
router.get('/', ctrl.list);
router.get('/total', ctrl.total);
router.get('/total-inactive', ctrl.totalInactive);
router.get('/find/:term', ctrl.find);

router.patch('/update/:id', ctrl.update);
router.delete('/delete/:id', ctrl.remove); 

router.post('/create', ctrl.create);

// Maintenance
router.get('/:cam_id/maintenance',ctrl.listMaintenanceByCamId);
router.get('/maintenance',ctrl.listMaintenance);
router.post('/:cam_id/maintenance/create', ctrl.createMaintenance);
router.patch('/:cam_id/maintenance/delete', ctrl.softDeleteMaintenance);
router.put('/:cam_id/maintenance/update', ctrl.updateMaintenance);

router.get('/event-detection', ctrl.listEventDetection);
router.post('/createDetect',ctrl.createEventDetection);
router.put("/event-detection/:cds_id/update", ctrl.updateEventDetection);
router.patch('/:cds_id/deleteDetect', ctrl.softDeleteEventDetect);

router.patch('/:cam_id/change', ctrl.change);

router.patch('/:cam_id/access', ctrl.updateAccess);

export default router;