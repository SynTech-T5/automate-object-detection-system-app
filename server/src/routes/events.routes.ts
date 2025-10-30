/**
 * Events Router (RESTful)
 *
 * Base: /api/events
 *
 * ## Events
 *  - GET    /                      → ดึงรายการ Events ทั้งหมด (รองรับ filter/pagination)
 *  - POST   /                      → เพิ่ม Event ใหม่
 *  - GET    /:evt_id               → ดึงข้อมูล Event เดี่ยว
 *  - PUT    /:evt_id               → อัปเดตข้อมูล Event
 *  - PATCH  /:evt_id               → ลบแบบนุ่ม (soft delete)
 *
 * ## Global Detection Settings
 *  - GET    /global                → ดึงรายการ Global Detection Settings ของทุก Event
 *  - GET    /:evt_id/global        → ดึง Global Detection Setting ของ Event เดี่ยว
 *  - PUT    /:evt_id/global        → อัปเดต Global Detection Setting ของ Event
 *
 * @module routes/events
 * @requires express
 * @requires controllers/events.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-10-30
 */

import { Router } from "express";
import * as ctrl from "../controllers/events.controller";

const router = Router();

/* ===================== Global Detection Settings ===================== */
router.get("/global", ctrl.getGlobalEvents);
router.get("/:evt_id/global", ctrl.getGlobalEventById);
router.put("/:evt_id/global", ctrl.updateGlobalEvent);

/* ========================== Events ========================== */
router.get("/", ctrl.getEvents);
router.post("/", ctrl.createEvent);
router.get("/:evt_id", ctrl.getEventById);
router.put("/:evt_id", ctrl.updateEvent);
router.patch("/:evt_id", ctrl.softDeleteEvent);

export default router;