/**
 * Cameras Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการจัดการกล้อง (Cameras):
 *  - GET /api/cameras                                  → ดึงรายการกล้องทั้งหมด
 *  - GET /api/cameras/total                            → ดึงจำนวนกล้องทั้งหมด
 *  - GET /api/cameras/:cam_id/maintenance              → ดึงข้อมูลการบำรุงรักษาของกล้องตาม cam_id
 *  - GET /api/cameras/maintenance                      → ดึงรายการประวัติการซ่อมบำรุงกล้องทั้งหมด
 *  - POST /api/maintenance_history/:cam_id/create      → สร้าง Maintenance History ใหม่
 *  - POST /api/maintenance_history/:cam_id/delete      → ลบ Maintenance History
 *  - GET /api/cameras/event-detection                  → ดึงรายการ EventDetection ทั้งหมด
 *  - POST /api/events/createDetect                     → สร้าง EventDetect 
 *  - PUT /api/cameras/event-detection/:cds_id/update   → แก้ไข EventDetection ที่เลือก
 *  - PATCH /api/camers/:cam_id                         → update status กล้องตาม cam_id
 *  - PATCH /api/events/:cds_id/deleteDetect            → ลบ EventDetection ที่เลือกโดยการเปลี่ยนสถานะแทนการลบจริง
 *
 * @module routes/cameras
 * @requires express
 * @requires controllers/cameras.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-08-17
 */
import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

// Cameras
router.get('/', ctrl.list);
router.get('/total', ctrl.total);
// Maintenance
router.get('/:cam_id/maintenance',ctrl.listMaintenanceByCamId);
router.get('/maintenance',ctrl.listMaintenance);
router.post('/:cam_id/maintenance/create', ctrl.create);
router.post('/:cam_id/maintenance/delete', ctrl.softDelete);

router.get('/event-detection', ctrl.listEventDetection);
router.post('/createDetect',ctrl.createEventDetection);
router.put("/event-detection/:cds_id/update", ctrl.updateEventDetection);
router.patch('/:cds_id/deleteDetect', ctrl.softDeleteEventDetect);

router.patch('/:cam_id/change', ctrl.change);

export default router;