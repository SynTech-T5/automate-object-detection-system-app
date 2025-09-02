import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import type { Response } from "express";

export type StreamOptions = {
  /** บังคับเข้ารหัสใหม่ด้วย x264 (ถ้า false จะพยายาม copy เพื่อให้หน่วงต่ำ/กิน CPU น้อย) */
  forceEncode?: boolean;
  /** ความยาว GOP (เฟรม) เช่น 30 ที่ 30fps = 1 วินาทีต่อ IDR */
  gop?: number;
  /** เวลา timeout RTSP input (มิลลิวินาที) */
  stimeoutMs?: number;
};

export class FFmpegService {
  startStream(res: Response, rtspUrl: string, opts: StreamOptions = {}) {
    const {
      forceEncode = process.env.FORCE_ENCODE === "1",
      gop = Number(process.env.FF_GOP || 30),
      stimeoutMs = Number(process.env.FF_STIMEOUT_MS || 5000),
    } = opts;

    // เฮดเดอร์สำหรับ fMP4 ที่เล่นบนเบราว์เซอร์ได้ทันที
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.socket?.setTimeout(0); // ไม่ให้ timeout เอง

    const videoArgs = forceEncode
      ? ["-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency"]
      : ["-c:v", "copy"]; // ถ้าเล่นไม่ได้ค่อยสลับไป forceEncode

    const ffArgs = [
      "-rtsp_transport", "tcp",
      "-stimeout", String(stimeoutMs * 1000), // ffmpeg ใช้หน่วย "ไมโครวินาที"
      "-fflags", "nobuffer",
      "-flags", "low_delay",
      "-i", rtspUrl,
      "-g", String(gop),
      "-force_key_frames", "expr:gte(t,n_forced*1)", // บังคับ IDR ประมาณทุก 1s
      ...videoArgs,
      "-an",
      "-f", "mp4",
      "-movflags", "frag_keyframe+empty_moov+default_base_moof",
      "pipe:1",
    ];

    const ff = spawn("ffmpeg", ffArgs, { stdio: ["ignore", "pipe", "pipe"] });

    ff.stdout.pipe(res);

    ff.stderr.on("data", (d) => {
      // คุณอาจสลับไปใช้ logger ของโปรเจกต์
      console.error("[ffmpeg]", d.toString());
    });

    const kill = (sig: NodeJS.Signals = "SIGINT") => {
      if (!ff.killed) ff.kill(sig);
    };

    res.on("close", () => {
      // client ปิด → ปิด ffmpeg ด้วย
      kill("SIGINT");
      setTimeout(() => kill("SIGKILL"), 2000);
    });

    ff.on("error", (err) => {
      console.error("spawn ffmpeg error:", err);
      if (!res.headersSent) res.status(502).end("ffmpeg failed to start");
      try { kill("SIGKILL"); } catch {}
    });

    ff.on("close", (code) => {
      console.log(`ffmpeg exited: ${code}`);
      if (!res.writableEnded) res.end();
    });
  }
}

export const ffmpegService = new FFmpegService();