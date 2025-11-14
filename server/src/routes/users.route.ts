/**
 * Users Router (RESTful)
 *
 * Base: /api/users
 *
 * ## Users
 *  - GET    /                    → ดึงข้อมูลผู้ใช้ทั้งหมด หรือระบุผ่าน query (optional)
 *  - GET    /:usr_id             → ดึงข้อมูลผู้ใช้ตามรหัส (ยังไม่ใช้ในรุ่นนี้)
 *
 * ## Profile
 *  - PATCH  /:usr_id/profile     → อัปเดตข้อมูลส่วนตัวของผู้ใช้
 *
 * ## Password
 *  - PATCH  /:usr_id/password    → เปลี่ยนรหัสผ่านของผู้ใช้
 *
 * @module routes/users
 * @requires express
 * @requires controllers/users.controller
 *
 * @author Wanasart
 * @created 2025-10-30
 * @lastModified 2025-10-30
 */

import { Router } from "express";
import * as ctrl from "../controllers/users.controller";

const router = Router();

/* ========================== Profile ========================== */
router.patch("/:usr_id/profile", ctrl.updateProfile);

/* ========================== Password ========================== */
router.patch("/:usr_id/password", ctrl.updatePassword);

/* ========================== Users ========================== */
router.get("/", ctrl.getUserById);

export default router;
