import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';

const router = Router();

router.post('/', ctrl.register);

export default router;