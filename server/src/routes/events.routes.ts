/**
 * Events Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการจัดการ Events:
 *  - GET  /api/events   → ดึงรายการ events ทั้งหมด
 *  - POST /api/events   → สร้าง event ใหม่
 *
 * @module routes/events
 * @requires express
 * @requires controllers/events.controller
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-08-16
 */
import { Router } from "express";
import * as ctrl from '../controllers/events.controller';

const router = Router();

router.get('/', ctrl.list);     
router.post('/', ctrl.create);

export default router;