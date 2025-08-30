import { Request, Response } from "express";
import { ffmpegService } from "../services/cameras/ffmpeg.service";

export class CameraController {
  public stream(req: Request, res: Response) {
    // ตอนนี้ไม่ต้องส่ง id หรือหาใน DB
    // เพราะ service มี URL กำหนดไว้แล้ว
    ffmpegService.startStream(res);
  }
}

export const cameraController = new CameraController();