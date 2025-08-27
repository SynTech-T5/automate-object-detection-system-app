/**
 * Cameras Router (RESTful)
 *
 * Base: /api/cameras
 *
 * Collections
 *  - GET    /                  → ดึงรายการกล้องทั้งหมด
 *  - POST   /                  → เพิ่มกล้องใหม่
 *
 * Item
 *  - GET    /:cam_id           → ดูรายละเอียดกล้องตาม cam_id
 *  - PATCH  /:cam_id           → อัปเดตข้อมูล/สถานะกล้องตาม cam_id
 *  - PATCH  /:cam_id/activate  → เปลี่ยนแปลงบางฟิลด์ของกล้อง
 *  - PATCH  /:cam_id/soft-delete → ลบแบบนุ่ม
 *  - DELETE /:cam_id           → ลบจริง (ปิดไว้)
 *
 * Utilities & Lookups
 *  - GET    /cards             → ข้อมูลสรุปแบบการ์ด (UI use-case)
 *  - GET    /status            → สถานะกล้อง (active/inactive) + ค่าเฉลี่ยสุขภาพ
 *  - GET    /total             → จำนวนกล้องทั้งหมด
 *  - GET    /total-inactive    → จำนวนกล้องที่ไม่ใช้งาน
 *  - GET    /search/:term      → ค้นหากล้อง (id/ชื่อ/สถานที่) *รองรับ path param*
 *    หมายเหตุ: ถ้าจะใช้ query string ก็ใช้ /search?q=... และให้ ctrl รองรับเอง
 *  - GET    /location          → รายการ location (lookup)
 *
 * Subresources - Access Control
 *  - GET    /access-controls           → ดึงรายการ Access Control ของทุกกล้อง
 *  - GET    /:cam_id/access-control    → ดึงของกล้องหนึ่งตัว
 *  - PATCH  /:cam_id/access-control    → อัปเดตของกล้องหนึ่งตัว
 *
 * Subresources - Maintenances
 *  - GET    /maintenances                              → ประวัติซ่อมบำรุงของทุกกล้อง
 *  - GET    /:cam_id/maintenances                      → ของกล้องตาม cam_id
 *  - POST   /:cam_id/maintenances                      → สร้างรายการใหม่ให้กล้องนั้น
 *  - PUT    /:cam_id/maintenances/:mtn_id              → อัปเดตรายการหนึ่ง
 *  - PATCH  /:cam_id/maintenances/:mtn_id/soft-delete  → ลบแบบนุ่ม
 *
 * Subresources - Event Detections
 *  - GET    /event-detections                      → ทั้งหมด
 *  - POST   /event-detections                      → สร้างใหม่
 *  - PUT    /event-detections/:cds_id              → แก้ไข
 *  - PATCH  /event-detections/:cds_id/soft-delete  → ลบแบบนุ่ม
 *
 * @module routes/cameras
 * @requires express
 * @requires controllers/cameras.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-08-27
 */

import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller';

const router = Router();

/* ========================== Collections (Base) ========================== */
router.get('/', ctrl.index);
router.post('/', ctrl.store);

/* ======================= Utilities & Lookups ======================= */
// Disabled     // router.get('/cards', ctrl.cardsSummary);
router.get('/status', ctrl.status);
// Disabled     // router.get('/total', ctrl.count);
// Disabled     // router.get('/total-inactive', ctrl.countInactive);
// Disabled     // router.get('/search/:term', ctrl.search);
router.get('/location', ctrl.location);

/* ===================== Subresources: Access Control ===================== */
router.get('/access-controls', ctrl.indexAccessControls);
router.get('/:cam_id/access-control', ctrl.showAccessControl);
// Bug          // router.patch('/:cam_id/access-control', ctrl.updateAccessControl);

/* ===================== Subresources: Maintenances ===================== */
router.get('/maintenances', ctrl.indexMaintenances);
router.get('/:cam_id/maintenances', ctrl.indexCameraMaintenances);
// Bug          // router.post('/:cam_id/maintenances', ctrl.storeCameraMaintenance);
// Bug          // router.put('/:cam_id/maintenances/:mtn_id', ctrl.updateCameraMaintenance);
// Bug          // router.patch('/:cam_id/maintenances/:mtn_id/soft-delete', ctrl.softDeleteCameraMaintenance);
// router.get('/:cam_id/maintenances/:mtn_id', ctrl.showCameraMaintenance);                 // NEW
// router.patch('/:cam_id/maintenances/:mtn_id/restore', ctrl.restoreCameraMaintenance);    // optional

/* =================== Subresources: Event Detections =================== */
router.get('/event-detections', ctrl.indexEventDetections);
router.post('/event-detections', ctrl.storeEventDetection);
router.put('/event-detections/:cds_id', ctrl.updateEventDetection);
router.patch('/event-detections/:cds_id/soft-delete', ctrl.softDeleteEventDetection);
// router.get('/event-detections/:cds_id', ctrl.showEventDetection);                       // NEW
// router.get('/:cam_id/event-detections', ctrl.indexCameraEventDetections);               // NEW
// router.patch('/event-detections/:cds_id/restore', ctrl.restoreEventDetection);          // optional

/* ============================== Item ============================== */
router.get('/:cam_id', ctrl.show);
router.patch('/:cam_id', ctrl.update);
router.patch('/:cam_id/activate', ctrl.activate);
router.patch('/:cam_id/soft-delete', ctrl.softDelete);
// router.delete('/:cam_id', ctrl.destroy);
// router.patch('/:cam_id/restore', ctrl.restore); // optional

export default router;