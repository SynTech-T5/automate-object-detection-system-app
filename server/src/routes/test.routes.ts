import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// ทดสอบ 500 → ให้โยน error หรือส่ง status 500
router.get('/500', (req: Request, res: Response, next: NextFunction) => {
    // วิธีที่ 2: ใช้ next(error) ให้ไปที่ global error handler
    next(new Error('This is a test internal server error (500) from Express'));
});

// ทดสอบ 404 → not-found
router.get('/404', (req: Request, res: Response) => {
    res.status(404).json({ error: 'This is a test not-found (404) response from Express' });
});

export default router;