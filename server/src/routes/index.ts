import { Router } from 'express';
import cameras from './cameras.routes'

const router = Router();

router.use('/cameras', cameras);

export default router;