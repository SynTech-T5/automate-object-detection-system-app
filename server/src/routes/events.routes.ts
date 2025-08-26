/**
 * Events Router (RESTful)
 * 
 * Base: /api/events
 *
 * กำหนดเส้นทาง (routes) สำหรับจัดการ Events:
 *  - GET    /                    → ดึงรายการ events ทั้งหมด (รองรับ filter/pagination ผ่าน query)
 *  - POST   /                    → เพิ่ม Event ใหม่
 *  - GET    /:evt_id             → ดึง Event ตามรหัส
 *  - PATCH  /:evt_id             → แก้ไขบางฟิลด์ของ Event ตามรหัส
 *  - PUT    /:evt_id             → แทนที่ข้อมูล Event ทั้งตัว (ถ้ารองรับ)
 *  - PATCH  /:evt_id/soft-delete → ลบแบบนุ่ม (เปลี่ยนสถานะแทนการลบจริง)
 *  - PATCH  /:evt_id/restore     → ย้อนสถานะกลับให้ใช้งาน
 *  - DELETE /:evt_id             → ลบจริง (ถ้าจำเป็น)
 *  - GET    /stats               → สถิติ (เช่น จำนวนทั้งหมด/ใช้งาน/ไม่ใช้งาน)
 *
 * @module routes/events
 * @requires express
 * @requires controllers/events.controller
 * 
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-08-20
 */
import { Router } from "express";
import * as ctrl from "../controllers/events.controller";

const router = Router();

/* ---------- Utilities ---------- */
// router.get("/stats", ctrl.stats);

/* ---------- Collection ---------- */
router.get("/", ctrl.index);
router.post("/", ctrl.store);

/* ---------- Item ---------- */
router.get("/:evt_id", ctrl.show);
router.patch("/:evt_id", ctrl.update);
router.put("/:evt_id", ctrl.update);
router.patch("/:evt_id/soft-delete", ctrl.softDelete);
// router.patch("/:evt_id/restore", ctrl.restore);
// router.delete("/:evt_id", ctrl.destroy);

export default router;
