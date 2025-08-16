/**
 * Registration Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการสมัครสมาชิกผู้ใช้ใหม่:
 *  - POST /api/register   → สมัครสมาชิก (สร้าง user ใหม่ + คืน token)
 *
 * @module routes/register
 * @requires express
 * @requires controllers/auth.controller
 *
 * @author Wanasart
 * @created 2025-08-15
 * @lastModified 2025-08-15
 */
import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/', ctrl.register);

export default router;