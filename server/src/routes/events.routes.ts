import { Router } from "express";
import * as ctrl from '../controllers/events.controller';

const router = Router();

router.post('/', ctrl.create);

export default router;