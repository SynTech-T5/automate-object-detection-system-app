import { Request, Response, NextFunction } from "express";
import * as LogService from '../services/logs.service';

// 2025-10-31
export async function getCameraLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LogService.getCameraLogs();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};

// 2025-10-31
export async function getAlertLogs(req: Request, res: Response, next: NextFunction) {
    try {
        const list = await LogService.getAlertLogs();
        return res.status(200).json({ message: 'Fetched successfully', data: list });
    } catch (err) {
        next(err);
    }
};