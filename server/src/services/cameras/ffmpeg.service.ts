import { spawn } from "child_process";
import { Response } from "express";

class FFmpegService {
  public startStream(res: Response, rtspUrl: string) {
    // ตั้งค่าให้ response เป็น video/mp4
    res.setHeader("Content-Type", "video/mp4");

    // ffmpeg command
    const ffmpeg = spawn("ffmpeg", [
      "-i", rtspUrl,                // input: RTSP URL
      "-f", "mp4",                  // output format mp4
      "-vcodec", "libx264",         // encode เป็น H.264
      "-preset", "ultrafast",       // ลด latency
      "-tune", "zerolatency",       // สำหรับ streaming
      "-movflags", "frag_keyframe+empty_moov", // ให้ browser เล่นได้ทันที
      "-an",                        // ตัดเสียงออก (จะใส่ก็ได้ "-acodec aac")
      "pipe:1"                      // ส่งออกผ่าน stdout
    ]);

    // ส่ง stream ออกไปยัง client
    ffmpeg.stdout.pipe(res);

    // log error จาก ffmpeg (stderr)
    ffmpeg.stderr.on("data", (data) => {
      console.error("FFmpeg error:", data.toString());
    });

    // เมื่อ ffmpeg ปิด → ปิด response
    ffmpeg.on("close", (code) => {
      console.log(`FFmpeg closed with code ${code}`);
      res.end();
    });

    // ถ้า client ปิด connection → kill ffmpeg ด้วย
    res.on("close", () => {
      console.log("Client disconnected, killing FFmpeg");
      ffmpeg.kill("SIGINT");
    });
  }
}

export const ffmpegService = new FFmpegService();
