/**
 * Events Router
 *
 * กำหนดเส้นทาง (routes) สำหรับจัดการ Events:
 *  - GET  /api/events   → ดึงรายการ events ทั้งหมด
 *  - POST /api/events   → เพิ่ม Event ใหม่
 *  - PUT /api/events/:evt_id/update → แก้ไข Event ที่ทำการเลือก
 *  - PATCH /api/events/:evt_id/delete → ลบ Event ที่ทำการเลือกโดยการเปลี่ยนสถานะแทนการลบจริง
 * 
 * @module routes/events
 * @requires express
 * @requires controllers/event.controller
 *
 * @author Fasai
 * @created 2025-08-16
 * @lastModified 2025-08-16
 */
import { Router } from "express";
import * as ctrl from '../controllers/events.controller';

const router = Router();

router.get('/', ctrl.list);
router.get('/', ctrl.list);     

router.post('/', ctrl.create);

router.put('/:evt_id/update', ctrl.update);

router.patch('/:evt_id/delete', ctrl.softDelete);

export default router;