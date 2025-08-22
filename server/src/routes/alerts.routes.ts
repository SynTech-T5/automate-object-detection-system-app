/**
 * Alerts Router (RESTful)
 * 
 * Base: /api/alerts
 *
 * จัดการทรัพยากร Alerts และ subresources (logs, notes) + analytics:
 *
 * Collections
 *  - GET    /                       → ดึง alerts ทั้งหมด (รองรับ filter/pagination ผ่าน query)
 *  - POST   /                       → สร้าง alert ใหม่
 *
 * Item
 *  - GET    /:alr_id                → ดึง alert เดี่ยว
 *  - PATCH  /:alr_id                → อัปเดตบางฟิลด์ของ alert
 *  - PATCH  /:alr_id/soft-delete    → ลบแบบนุ่ม (เปลี่ยนสถานะ)
 *  - PATCH  /:alr_id/restore        → กู้คืนจาก soft-delete
 *  - DELETE /:alr_id                → ลบจริง (ถ้าจำเป็น)
 *
 * Subresources
 *  - Logs (read-only):
 *      GET   /:alr_id/logs
 *  - Notes:
 *      GET   /:alr_id/notes
 *      POST  /:alr_id/notes
 *      PATCH /:alr_id/notes/:note_id
 *      PATCH /:alr_id/notes/:note_id/soft-delete
 *      PATCH /:alr_id/notes/:note_id/restore
 *
 * Relations / Filters
 *  - GET    /by-event/:evt_id       → ดึง alerts ที่สัมพันธ์กับ event ที่กำหนด
 *    (แนะนำให้ย้ายไปที่ Events Router เป็น: GET /api/events/:evt_id/alerts)
 *
 * Analytics (ย้าย path ให้เป็นสากล, ใช้ query แทนพารามิเตอร์ path):
 *  - GET    /analytics/trend?days_back=30
 *  - GET    /analytics/distribution
 *
 * @module routes/alerts
 * @requires express
 * @requires controllers/alerts.controller
 *
 * @author Wanasart
 * @created 2025-08-15
 * @lastModified 2025-08-20
 * 
 */
import { Router } from "express";
import * as ctrl from "../controllers/alerts.controller";

const router = Router();

/* ---------- Analytics (static ก่อน :alr_id) ---------- */
router.get("/analytics/trend", ctrl.trendAnalytics);              // แทน /:days_back/trend → ใช้ query ?days_back=
router.get("/analytics/distribution", ctrl.distributionAnalytics);

/* ---------- Relations / Filters ---------- */
router.get("/by-event/:evt_id", ctrl.indexByEvent);               // ชั่วคราว; แนะนำย้ายไป /api/events/:evt_id/alerts

/* ---------- Notes (subresource) ---------- */
router.get("/:alr_id/notes", ctrl.indexNotes);
// router.post("/:alr_id/notes", ctrl.storeNote);
// router.patch("/:alr_id/notes/:note_id", ctrl.updateNote);
// router.patch("/:alr_id/notes/:note_id/soft-delete", ctrl.softDeleteNote);
// router.patch("/:alr_id/notes/:note_id/restore", ctrl.restoreNote);

/* ---------- Logs (subresource: read-only) ---------- */
router.get("/:alr_id/logs", ctrl.indexLogs);

/* ---------- Collection ---------- */
router.get("/", ctrl.index);
router.post("/", ctrl.store);

/* ---------- Item ---------- */
// router.get("/:alr_id", ctrl.show);
router.patch("/:alr_id", ctrl.update);
router.patch("/:alr_id/soft-delete", ctrl.softDelete);
// router.patch("/:alr_id/restore", ctrl.restore);
// router.delete("/:alr_id", ctrl.destroy); // optional

export default router;