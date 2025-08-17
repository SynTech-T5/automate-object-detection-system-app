/**
 * Cameras Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการจัดการกล้อง (Cameras):
 *  - GET /api/cameras          → ดึงรายการกล้องทั้งหมด
 *  - GET /api/cameras/total    → ดึงจำนวนกล้องทั้งหมด
 *  - GET /api/cameras/:cam_id  → ดึงข้อมูลการบำรุงรักษาของกล้องตาม cam_id
 *  - PATCH /api/camers/:cam_id → update status กล้องตาม cam_id
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

router.get('/event-detection', ctrl.listEventDetection);

router.put("/event-detection/:cds_id/update", ctrl.updateEventDetection);

router.patch('/:cam_id/change', ctrl.change);

export default router;