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
 * @lastModified 2025-08-16
 */
import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

router.get('/', ctrl.list);
router.get('/total', ctrl.total);
router.get('/:cam_id', ctrl.maintenance); // ปรับให้ดึงจาก cam_id ได้ด้วย
router.patch('/:cam_id', ctrl.change); // ปรับให้แก้จาก cam_id ได้ด้วย

export default router;