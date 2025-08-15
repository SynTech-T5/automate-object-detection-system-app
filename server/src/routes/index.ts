import { Router } from 'express';
import cameras from './cameras.routes'
import login from './login.routes';
import register from './register.routes';

const router = Router();

// Authentication routes
router.use('/auth', login);

// Registration routes
router.use('/register', register);

// Camera routes
router.use('/cameras', cameras);

export default router;