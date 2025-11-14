/**
 * Cameras Router (RESTful)
 *
 * Base: /api/cameras
 *
 * ## Cameras
 *  - GET    /                     → ดึงรายการกล้องทั้งหมด
 *  - GET    /summary              → ดึงสรุปภาพรวมของกล้อง
 *  - GET    /:cam_id              → ดึงข้อมูลกล้องตาม cam_id
 *  - POST   /                     → เพิ่มกล้องใหม่
 *  - PUT    /:cam_id              → อัปเดตข้อมูลกล้อง
 *  - PATCH  /:cam_id              → ลบกล้อง (soft delete)
 *
 * ## Performance
 *  - GET    /performance          → ดึงภาพรวมข้อมูลประสิทธิภาพของกล้องทั้งหมด
 *  - GET    /:cam_id/performance  → ดึงข้อมูลประสิทธิภาพของกล้องตาม cam_id
 *
 * ## Event Detection
 *  - GET    /:cam_id/event-detections   → ดึงการตั้งค่า event detection ของกล้องตาม cam_id
 *  - PUT    /event-detections/:cds_id   → อัปเดตการตั้งค่า event detection ตาม cds_id
 *
 * ## Maintenance
 *  - GET    /:cam_id/maintenance        → ดึงข้อมูลประวัติการบำรุงรักษากล้อง
 *  - POST   /:cam_id/maintenance        → เพิ่มข้อมูลการบำรุงรักษาใหม่
 *  - PUT    /maintenance/:mnt_id        → อัปเดตข้อมูลการบำรุงรักษา
 *  - PATCH  /maintenance/:mnt_id        → ลบข้อมูลการบำรุงรักษา (soft delete)
 *
 * ## Access Control
 *  - GET    /:cam_id/permission         → ดึงสิทธิ์การเข้าถึงของกล้อง
 *  - PUT    /:cam_id/permission         → อัปเดตสิทธิ์การเข้าถึงของกล้อง
 *
 * @module routes/cameras
 * @requires express
 * @requires controllers/cameras.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-10-30
 */

import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller';

const router = Router();

/* ========================== Cameras ========================== */
router.get('/', ctrl.getCameras);
router.get('/summary', ctrl.getSummaryCameras);
router.get('/:cam_id', ctrl.getCameraById);
router.post('/', ctrl.createCamera);
router.put('/:cam_id', ctrl.updateCamera);
router.patch('/:cam_id', ctrl.softDeleteCamera);

/* ========================== Performance ========================== */
router.get('/performance', ctrl.getPerformance);
router.get('/:cam_id/performance', ctrl.getPerformanceById);

/* ========================== Event Detection ========================== */
router.get('/:cam_id/event-detections', ctrl.getEventDetectionById);
router.put('/event-detections/:cds_id', ctrl.updateEventDetection);

/* ========================== Maintenance ========================== */
router.get('/:cam_id/maintenance', ctrl.getMaintenanceByCameraId);
router.post('/:cam_id/maintenance', ctrl.createMaintenance);
router.put('/maintenance/:mnt_id', ctrl.updateMaintenance);
router.patch('/maintenance/:mnt_id', ctrl.softDeleteMaintenance);

/* ========================== Access Control ========================== */
router.get('/:cam_id/permission', ctrl.getPermissionByCameraId);
router.put('/:cam_id/permission', ctrl.updatePermission);

export default router;