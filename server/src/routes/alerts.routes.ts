/**
 * Alerts Router (RESTful)
 *
 * Base: /api/alerts
 *
 * ## Alerts
 *  - GET    /                      → ดึงรายการ alerts ทั้งหมด (รองรับ filter/pagination)
 *  - POST   /                      → สร้าง alert ใหม่
 *  - GET    /:alr_id               → ดึงข้อมูล alert รายการเดียว
 *  - PATCH  /:alr_id/status        → อัปเดตสถานะของ alert
 *  - GET    /:alr_id/related       → ดึงข้อมูลที่เกี่ยวข้องกับ alert
 *
 * ## Notes
 *  - GET    /:alr_id/notes         → ดึงโน้ตของ alert
 *  - POST   /:alr_id/notes         → เพิ่มโน้ตใหม่
 *  - PUT    /notes/:anh_id         → แก้ไขโน้ตตาม anh_id
 *  - PATCH  /notes/:anh_id         → ลบแบบนุ่ม (soft delete) โน้ต
 *
 * ## Logs
 *  - GET    /:alr_id/logs          → ดึงประวัติการทำงานของ alert
 *
 * ## Recent
 *  - GET    /recent                → ดึงรายการ alerts ล่าสุดของกล้อง
 *
 * @module routes/alerts
 * @requires express
 * @requires controllers/alerts.controller
 *
 * @author Wanasart
 * @created 2025-08-15
 * @lastModified 2025-10-30
 */

import { Router } from "express";
import * as ctrl from "../controllers/alerts.controller";

const router = Router();

/* ========================== Recent ========================== */
router.get("/recent", ctrl.getRecentCameraAlert);

/* ========================== Alerts ========================== */
router.get("/", ctrl.getAlerts);
router.post("/", ctrl.createAlert);
router.get("/:alr_id", ctrl.getAlertById);
router.patch("/:alr_id/status", ctrl.updateAlertStatus);
router.get("/:alr_id/related", ctrl.getAlertRelated);

/* ========================== Notes ========================== */
router.get("/:alr_id/notes", ctrl.getAlertNotes);
router.post("/:alr_id/notes", ctrl.createAlertNote);
router.put("/notes/:anh_id", ctrl.updateAlertNote);
router.patch("/notes/:anh_id", ctrl.softDeleteAlertNote);

/* ========================== Logs ========================== */
router.get("/:alr_id/logs", ctrl.getAlertLogs);

export default router;