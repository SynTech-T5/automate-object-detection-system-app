/**
 * Alerts Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการจัดการ Alerts:
 *  - GET /api/alerts                   → ดึงรายการ alerts ทั้งหมด
 *  - GET /api/alerts/:alr_id/logs      → ดึง log ของ alert ตาม alr_id
 *  - GET /api/alerts/:evt_id/related   → ดึง alerts ที่เกี่ยวข้องกับ event ที่กำหนด
 *  - GET /api/alerts/:alr_id/notes     → ดึง notes ของ alert ตาม alr_id
 *  - GET /api/alerts/:days_back/trend  → ดึงแนวโน้มของ alerts ในช่วงวันที่กำหนด
 *  - GET /api/alerts/distribution      → ดึงการกระจายของ alerts ตามประเภทต่างๆ
 *  - POST /api/alerts                  → สร้าง alert ใหม่
 *  - PATCH /api/alerts/:alr_id/update  → แก้ไขข้อมูล alert ตาม alr_id
 *  - PATCH /api/alerts/:alr_id/delete  → ลบ alert ตาม alr_id โดยการเปลี่ยนสถานะเป็นไม่ใช้งาน
 *
 * @module routes/alerts
 * @requires express
 * @requires controllers/alerts.controller
 *
 * @author Wanasart
 * @created 2025-08-15
 * @lastModified 2025-08-17
 */
import { Router } from "express";
import * as ctrl from "../controllers/alerts.controller";

const router = Router();

router.get("/", ctrl.list);
router.get("/:alr_id/logs", ctrl.logs);
router.get("/:evt_id/related", ctrl.related);
router.get("/:alr_id/notes", ctrl.notes);
router.get("/:days_back/trend", ctrl.trend);
router.get("/distribution", ctrl.distribution);

router.post("/", ctrl.create);

router.patch("/:alr_id/update", ctrl.update);
router.patch("/:alr_id/delete", ctrl.softDelete);

export default router;