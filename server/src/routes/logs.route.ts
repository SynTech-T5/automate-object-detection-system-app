import { Router } from 'express';
import * as ctrl from '../controllers/logs.controller';

const router = Router();

/* ========================== Logs ========================== */
router.get('/camera', ctrl.getCameraLogs);
router.get('/alert', ctrl.getAlertLogs);
// router.get('/user', ctrl.getUserLogs);

export default router;