import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Response } from "express";

export class FFmpegService {
  private ffmpegProcess: ChildProcessWithoutNullStreams | null = null;

  // 👉 กำหนด RTSP URL ไว้ตรงนี้เลย
  private rtspUrl: string = "rtsp://relayreader:VeryStrongPassword123@100.114.77.30:9554/camerassg02";

  public startStream(res: Response) {
    res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");

    this.ffmpegProcess = spawn("ffmpeg", [
      "-i", this.rtspUrl, // ใช้ค่าใน property
      "-f", "mjpeg",
      "-q:v", "5",
      "pipe:1"
    ]);

    this.ffmpegProcess.stdout.on("data", (chunk) => {
      res.write(`--frame\r\nContent-Type: image/jpeg\r\n\r\n`);
      res.write(chunk);
    });

    this.ffmpegProcess.stderr.on("data", (err) => {
      console.error("[FFmpeg]", err.toString());
    });

    this.ffmpegProcess.on("close", () => {
      console.log("FFmpeg closed");
      res.end();
    });
  }

  public stopStream() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill("SIGINT");
      this.ffmpegProcess = null;
    }
  }
}

export const ffmpegService = new FFmpegService();
