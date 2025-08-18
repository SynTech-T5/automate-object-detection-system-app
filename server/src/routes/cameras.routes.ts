import { Router } from 'express';
import * as ctrl from '../controllers/cameras.controller'




const router = Router();

router.get('/testid', ctrl.list); //router show All cameras สร้างมาเทสไม่เกี่ยว


router.delete('/delete/:id', ctrl.remove); 

router.put('/update/:id', ctrl.update);

router.post('/create', ctrl.create);

router.get('/find/:term', ctrl.find);

export default router;