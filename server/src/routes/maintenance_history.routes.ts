/**
 * Maintenance History Router
 *
 * กำหนดเส้นทาง (routes) สำหรับการจัดการ Maintenance History:
 *  - POST /api/maintenance_history/:cam_id/create → สร้าง Maintenance History ใหม่
 *
 * @module routes/maintenance_history
 * @requires express
 * @requires controllers/maintenance_history.controller
 *
 * @author Napat
 * @created 2025-08-18
 * @lastModified 2025-08-18
 */

import { Router } from 'express';
import * as ctrl from '../controllers/maintenance_history.controller';

const router = Router();

router.post('/:cam_id/create', ctrl.create);

export default router;