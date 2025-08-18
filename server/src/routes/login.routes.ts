/**
 * Authentication Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการยืนยันตัวตนของผู้ใช้:
 *  - GET /api/auth/me      → ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ (session)
 *  - POST /api/auth/login   → เข้าสู่ระบบ (สร้าง session token และ cookie)
 *  - POST /api/auth/logout  → ออกจากระบบ (ลบ session cookie)
 *
 * @module routes/auth
 * @requires express
 * @requires controllers/auth.controller
 *
 * @author Wanasart
 * @created 2025-08-15
 * @lastModified 2025-08-18
 */
import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.get('/me',ctrl.me);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

export default router;