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
 *
 * @module routes/alerts
 * @requires express
 * @requires controllers/alerts.controller
 *
 * @author Wanasart
 * @created 15-08-2025
 * @lastModified 15-08-2025
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

export default router;