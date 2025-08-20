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
 *  - PATCH  /:cam_id           → อัปเดตข้อมูล/สถานะกล้องตาม cam_id
 *  - DELETE /:cam_id           → ลบกล้องตาม cam_id
 *
 * Utilities
 *  - GET    /cards             → ข้อมูลสรุปแบบการ์ด (UI use-case)
 *  - GET    /total             → จำนวนกล้องทั้งหมด
 *  - GET    /status            → สถานะกล้อง (active/inactive) และค่าเฉลี่ยสุขภาพ
 *  - GET    /total-inactive    → จำนวนกล้องที่ไม่ใช้งาน
 *  - GET    /search/:term      → ค้นหากล้อง (id/ชื่อ/สถานที่) *รองรับ path param*
 *    *หมายเหตุ: ถ้าจะใช้ query string ก็ใช้ /search?q=... และให้ ctrl รองรับเองได้*
 *
 * Access Control (subresource)
 *  - GET    /access-controls           → ดึงรายการ Access Control ของทุกกล้อง
 *  - GET    /:cam_id/access-control    → ดึง Access Control ของกล้องหนึ่งตัว
 *  - PATCH  /:cam_id/access-control    → อัปเดต Access Control ของกล้องหนึ่งตัว
 *
 * Maintenances (subresource)
 *  - GET    /maintenances                              → ประวัติซ่อมบำรุงของทุกกล้อง
 *  - GET    /:cam_id/maintenances                      → ประวัติซ่อมบำรุงของกล้องตาม cam_id
 *  - POST   /:cam_id/maintenances                      → สร้าง Maintenance History ใหม่ให้กล้องนั้น
 *  - PUT    /:cam_id/maintenances/:mtn_id              → อัปเดต Maintenance History หนึ่งรายการ
 *  - PATCH  /:cam_id/maintenances/:mtn_id/soft-delete  → ลบแบบนุ่ม (เปลี่ยนสถานะแทนการลบจริง)
 *
 * Event Detections (collection อยู่ใต้ cameras เพื่อคง controller เดิม)
 *  - GET    /event-detections                      → ดึงรายการ EventDetection ทั้งหมด
 *  - POST   /event-detections                      → สร้าง EventDetection
 *  - PUT    /event-detections/:cds_id              → แก้ไข EventDetection ที่เลือก
 *  - PATCH  /event-detections/:cds_id/soft-delete  → ลบแบบนุ่ม EventDetection
 *
 * @module routes/cameras
 * @requires express
 * @requires controllers/cameras.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-08-20
 */
import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller';

const router = Router();

/* ---------- Utilities ---------- */
router.get('/cards', ctrl.cardsSummary);
router.get('/total', ctrl.count);
router.get('/status', ctrl.status);
router.get('/total-inactive', ctrl.countInactive);
router.get('/search/:term', ctrl.search);
// router.get('/stats', ctrl.stats);                          // optional (รวมสถิติ)

/* ---------- Access Control ---------- */
router.get('/access-controls', ctrl.indexAccessControls);
router.get('/:cam_id/access-control', ctrl.showAccessControl);
router.patch('/:cam_id/access-control', ctrl.updateAccessControl);

/* ---------- Maintenances ---------- */
router.get('/maintenances', ctrl.indexMaintenances);
router.get('/:cam_id/maintenances', ctrl.indexCameraMaintenances);
router.post('/:cam_id/maintenances', ctrl.storeCameraMaintenance);
router.put('/:cam_id/maintenances/:mtn_id', ctrl.updateCameraMaintenance);
router.patch('/:cam_id/maintenances/:mtn_id/soft-delete', ctrl.softDeleteCameraMaintenance);
// router.get('/:cam_id/maintenances/:mtn_id', ctrl.showCameraMaintenance);     // NEW
// router.patch('/:cam_id/maintenances/:mtn_id/restore', ctrl.restoreCameraMaintenance); // optional

/* ---------- Event Detections ---------- */
router.get('/event-detections', ctrl.indexEventDetections);
router.post('/event-detections', ctrl.storeEventDetection);
router.put('/event-detections/:cds_id', ctrl.updateEventDetection);
router.patch('/event-detections/:cds_id/soft-delete', ctrl.softDeleteEventDetection);
// router.get('/event-detections/:cds_id', ctrl.showEventDetection);            // NEW
// router.get('/:cam_id/event-detections', ctrl.indexCameraEventDetections);    // NEW
// router.patch('/event-detections/:cds_id/restore', ctrl.restoreEventDetection); // optional

/* ---------- Collection ---------- */
router.get('/', ctrl.index);
router.post('/', ctrl.store);

/* ---------- Item ---------- */
router.patch('/:cam_id', ctrl.update);
router.patch('/:cam_id/soft-delete', ctrl.softDelete);
// router.delete('/:cam_id', ctrl.destroy);
// router.get('/:cam_id', ctrl.show);
// router.patch('/:cam_id/restore', ctrl.restore);            // optional

export default router;