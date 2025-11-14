import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller';

const router = Router();

/* ========================== Locations ========================== */
router.get('/', ctrl.getLocation); // ✅

export default router;