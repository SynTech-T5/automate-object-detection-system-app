/**
 * Main Application Router
 *
 * รวมเส้นทาง (routes) ทั้งหมดของระบบ:
 *
 * ## Authentication
 *  - /api/auth           → การเข้าสู่ระบบ / ออกจากระบบ (Login / Logout)
 *  - /api/register       → การสมัครสมาชิกใหม่
 *
 * ## Core Modules
 *  - /api/cameras        → การจัดการกล้อง (Cameras)
 *  - /api/alerts         → การจัดการการแจ้งเตือน (Alerts)
 *  - /api/events         → การจัดการเหตุการณ์ (Events)
 *
 * ## Others
 *  - /api/locations      → การจัดการสถานที่ (Locations)
 *  - /api/users          → การจัดการผู้ใช้งาน (Users)
 *
 * @module routes/index
 * @requires express
 * @requires ./cameras.routes
 * @requires ./alerts.routes
 * @requires ./events.routes
 * @requires ./login.routes
 * @requires ./register.routes
 * @requires ./location.route
 * @requires ./users.route
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-10-31
 */

import { Router } from "express";

// Core modules
import cameras from "./cameras.routes";
import alerts from "./alerts.routes";
import events from "./events.routes";

// Authentication modules
import login from "./login.routes";
import register from "./register.routes";

// Others
import locations from "./location.route";
import users from "./users.route";

// Middlewares
import { authenticateToken } from "../controllers/auth.controller";

const router = Router();

/* ========================== Authentication ========================== */
router.use("/auth", login);
router.use("/register", register);

/* ============================ Core Modules ============================ */
router.use("/cameras", cameras);
router.use("/alerts", alerts);
router.use("/events", events);

/* ============================= Others ============================= */
router.use("/locations", locations);
router.use("/users", users);

export default router;