/**
 * Main Application Router
 *
 * รวมเส้นทาง (routes) ทั้งหมดของระบบ:
 *  - /api/auth      → Authentication (login/logout)
 *  - /api/register  → Registration (สมัครสมาชิกใหม่)
 *  - /api/cameras   → การจัดการกล้อง (Cameras)
 *  - /api/alerts    → การจัดการการแจ้งเตือน (Alerts)
 *  - /api/events    → การจัดการเหตุการณ์ (Events)
 *
 * @module routes/index
 * @requires express
 * @requires ./cameras.routes
 * @requires ./login.routes
 * @requires ./register.routes
 * @requires ./alerts.routes
 * @requires ./events.routes
 *
 * @author Wanasart
 * @created 2025-08-16
 * @lastModified 2025-08-17
 */
import { Router } from 'express';
import cameras from './cameras.routes'
import login from './login.routes';
import register from './register.routes';
import alerts from './alerts.routes';
import events from './events.routes'
import maintenance_history from './maintenance_history.routes';

const router = Router();

// Authentication routes
router.use('/auth', login);

// Registration routes
router.use('/register', register);

// Camera routes
router.use('/cameras', cameras);

// Alerts routes
router.use('/alerts', alerts);

// Events routes
router.use('/events', events);
// Maintenance History routes
router.use('/maintenance_history', maintenance_history)

export default router;