"use client";
import Image from "next/image";
import { MapPin, Video, Anchor } from "lucide-react";
import BottomCameraCard from "./bottomCameraCard";

export type Camera = {
  id: number;
  name: string;
  address: string;
  type: string;
  status: boolean;
  health: number;
  location: {
    id: number;
    name: string;
  }
};

export default function CameraCard({ cam }: { cam: Camera }) {
  const rawImg =
    (cam as any).cam_image ?? (cam as any).image_url ?? (cam as any).thumbnail ?? null;
  const rawVideo =
    (cam as any).cam_video ?? (cam as any).video_url ?? (cam as any).footage_url ?? null;

  // ถ้าไม่มีวิดีโอ ใช้ภาพแทน
  const imageSrc = rawImg || "/library-room.jpg";
  const videoSrc = rawVideo || "/footage-library-room.mp4"; // ใส่ไฟล์ไว้ใน /public หรือเปลี่ยนเป็น URL ภายนอก

  const camCode = `CAM${String(cam.id).padStart(3, "0")}`;

  return (
    <div className="rounded-xl border-1 border-[var(--color-primary)] bg-[var(--color-white)] shadow-sm p-4">
      {/* Image block */}
      <div className="relative overflow-hidden rounded-md">
        <div className="relative aspect-video">
          {videoSrc ? (
            <video
              src={videoSrc}
              // ถ้าจะให้กดเล่นเองก็เปลี่ยน controls เป็น true และปิด autoPlay ได้
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              preload="metadata"
              poster={imageSrc} // โชว์ภาพก่อนเล่น/เล่นไม่ได้
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                // ถ้าวิดีโอพัง ให้เอา poster แทน
                (e.currentTarget as HTMLVideoElement).style.display = "none";
              }}
            />
          ) : (
            <Image
              src={imageSrc}
              alt={cam.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 400px, 100vw"
            />
          )}
        </div>

        {/* CAM code — top-left */}
        <span className="absolute left-3 top-3 rounded-full border border-sky-300 bg-sky-100 px-3 py-0.5 text-[11px] font-semibold text-sky-800 shadow-sm">
          {camCode}
        </span>

        {/* Status (ใช้แบบเก่า Active/Inactive) — top-right */}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-0.5 text-[11px] font-semibold shadow-sm border
            ${cam.status
              ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]"
              : "bg-[var(--color-softGray)] text-[var(--color-black)] border-[var(--color-hardGray)]"
            }`}
        >
          {cam.status ? "Active" : "Inactive"}
        </span>

        {/* Location — bottom-left */}
        <span className="absolute left-3 bottom-3 inline-flex max-w-[75%] items-center gap-2 truncate rounded-full border bg-white/90 px-3 py-1 text-sm text-gray-700 shadow">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="truncate">{cam.location.name}</span>
        </span>
      </div>

      {/* Info under image */}
      <div className="mt-4">
        <h3 className="text-base font-semibold text-[var(--color-primary)]">{cam.name}</h3>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            <Anchor className="h-4 w-4" />
            {cam.type || "Fixed"}
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            <Video className="h-4 w-4" />
            Health: {cam.health}
          </span>
        </div>

        <BottomCameraCard camId={cam.id} iconSet="lucide" className="mt-4" />

      </div>
    </div>
  );
}