"use client";
import Image from "next/image";
import { MapPin, Video, Anchor, Camera as CameraIcon } from "lucide-react";
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

  const camIsActive = cam.status ? "border-[var(--color-primary)]" : "border-[var(--color-danger)]";
  const camIsActiveBG = cam.status ? "bg-[var(--color-primary-bg)] border border-[var(--color-primary)]" : "bg-[var(--color-danger-bg)] border border-[var(--color-danger)]";
  const camIsActiveIconBG = cam.status ? "border-[var(--color-primary)]" : "border-[var(--color-danger)]";
  const camIsActiveIcon = cam.status ? "bg-[var(--color-primary)]" : "bg-[var(--color-danger)]";

  // ถ้าไม่มีวิดีโอ ใช้ภาพแทน
  const imageSrc = rawImg || "/library-room.jpg";
  const videoSrc = rawVideo || "/footage-library-room.mp4"; // ใส่ไฟล์ไว้ใน /public หรือเปลี่ยนเป็น URL ภายนอก

  const camCode = `CAM${String(cam.id).padStart(3, "0")}`;

  return (
    <div className="relative mt-12"> {/* ← wrapper สำหรับ top decoration */}

      {/* Top background (แถบสีน้ำเงินด้านหลังการ์ด) */}
      <div
        aria-hidden
        className={`
          pointer-events-none
          absolute inset-x-0 -top-7 h-16
          rounded-2xl
          ${camIsActiveBG}
          shadow-sm
          z-0
        `}
      />

      {/* Floating icon (กล้องตรงกลางด้านบน) */}
      <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20">
        <div className={`grid place-items-center h-10 w-10 rounded-full bg-white border-1 ${camIsActiveIconBG} shadow`}>
          <div className={`grid place-items-center h-8 w-8 rounded-full ${camIsActiveIcon} ring-2 ring-white`}>
            <CameraIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* ตัวการ์ด */}
      <div className={`relative z-10 rounded-xl border ${camIsActive} bg-[var(--color-white)] shadow-sm p-4 overflow-hidden`}>
        {/* Image block */}
        <div className="relative overflow-hidden rounded-md">
          <div className="relative aspect-video">
            {videoSrc ? (
              <video
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                preload="metadata"
                poster={imageSrc}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
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

          {/* overlays เดิม */}
          <span className="absolute left-3 top-3 rounded-full border border-sky-300 bg-sky-100 px-3 py-0.5 text-[11px] font-semibold text-sky-800 shadow-sm">
            {camCode}
          </span>

          <span className={`absolute right-3 top-3 rounded-full px-3 py-0.5 text-[11px] font-semibold shadow-sm border
            ${cam.status
              ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger)]"
              : "bg-[var(--color-softGray)] text-[var(--color-black)] border-[var(--color-hardGray)]"
            }`}
          >
            {cam.status ? "Active" : "Inactive"}
          </span>

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
    </div>
  );
}