import { Router } from 'express';
import cameras from './cameras.routes'
import login from './login.routes';
import register from './register.routes';
import alerts from './alerts.routes';


const router = Router();

// Authentication routes
router.use('/auth', login);

// Registration routes
router.use('/register', register);

// Camera routes
router.use('/cameras', cameras);

// Alerts routes
router.use('/alerts', alerts);


export default router;