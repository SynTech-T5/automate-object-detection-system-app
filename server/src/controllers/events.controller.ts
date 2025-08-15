import { Request, Response, NextFunction } from "express";
import * as eventService from '../services/events.service';

export async function create(req: Request, res: Response, next: NextFunction){
    try{
        const { icon, name, description } = req.body;
        const createEvent = await eventService.createEvent(icon, name, description);
        return res.json(createEvent);
    }catch (err){
         next(err);
    }
}