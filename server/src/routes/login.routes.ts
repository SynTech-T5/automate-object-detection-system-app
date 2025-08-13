import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

export default router;