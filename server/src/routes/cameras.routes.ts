import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'

const router = Router();

router.get('/', ctrl.list);
router.get('/total', ctrl.total);

export default router;