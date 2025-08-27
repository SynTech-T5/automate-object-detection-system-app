"use client";


import Image from "next/image";
import { MapPin, Video, Anchor, Camera as CameraIcon } from "lucide-react";
import BottomCameraCard from "./bottomCameraCard";


export type Camera = {
  id: number;
  name: string;
  address: string;
  type: string;
  status: boolean; // true => Active, false => Inactive
  health: number;
  location: {
    id: number;
    name: string;
  };
  last_maintenance_date: string;
  last_maintenance_time: string;
};

// ---------- helpers ----------
function toBool(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;
  if (typeof raw === "string") {
    const v = raw.trim().toLowerCase();
    return v === "true" || v === "1" || v === "active";
  }
  return false;
}

function getStatusBool(cam: any): boolean {
  // ใช้ cam.status (boolean) เป็นหลัก แต่เผื่อมี cam_status จาก API เก่า ๆ
  const raw = cam?.status ?? cam?.cam_status ?? false;
  return toBool(raw);
}

function getLocationName(cam: any): string {
  return (
    cam?.location?.name ??
    cam?.cam_location ??
    (typeof cam?.location === "string" ? cam.location : "") ??
    "-"
  );
}

// ---------- component ----------
export default function CameraCard({ cam }: { cam: Camera }) {
  const rawImg =
    (cam as any).cam_image ??
    (cam as any).image_url ??
    (cam as any).thumbnail ??
    null;

  const rawVideo =
    (cam as any).cam_video ??
    (cam as any).video_url ??
    (cam as any).footage_url ??
    null;

  const statusBool = getStatusBool(cam);
  const statusLabel = statusBool ? "Active" : "Inactive";


  const camBorder = statusBool
    ? "border-[var(--color-primary)]"
    : "border-[var(--color-danger)]";

  const camHeaderBG = statusBool
    ? "bg-[var(--color-primary-bg)] border border-[var(--color-primary)]"
    : "bg-[var(--color-danger-bg)] border border-[var(--color-danger)]";

  const camIconRing = statusBool
    ? "border-[var(--color-primary)]"
    : "border-[var(--color-danger)]";

  const camIconBG = statusBool
    ? "bg-[var(--color-primary)]"
    : "bg-[var(--color-danger)]";

  // ถ้าไม่มีวิดีโอ ใช้ภาพแทน
  const imageSrc = rawImg || "/library-room.jpg";
  const videoSrc = rawVideo || "/footage-library-room.mp4"; // ไม่มีวิดีโอจริง ๆ ให้ปล่อยเป็น "" จะไม่ render <video>

  const camCode = `CAM${String(cam.id).padStart(3, "0")}`;
  const locationName = getLocationName(cam);
  const typeLabel = cam.type || "Fixed";
  const healthText =
    typeof cam.health === "number" ? `${cam.health}%` : String(cam.health ?? "-");

  return (
    <div className="relative mt-12">
      {/* Top background (แถบสีหลังการ์ด) */}
      <div
        aria-hidden
        className={`
          pointer-events-none absolute inset-x-0 -top-7 h-16
          rounded-2xl ${camHeaderBG} shadow-sm z-0
        `}
      />

      {/* Floating icon (กล้องตรงกลางด้านบน) */}
      <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20">
        <div className={`grid place-items-center h-10 w-10 rounded-full bg-white ${camIconRing} shadow`}>
          <div className={`grid place-items-center h-8 w-8 rounded-full ${camIconBG} ring-2 ring-white`}>
            <CameraIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* การ์ดหลัก */}
      <div className={`relative z-10 rounded-xl border ${camBorder} bg-[var(--color-white)] shadow-sm p-4 overflow-hidden`}>
        {/* Media block */}
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
                onError={(e) => {
                  // ถ้าวิดีโอพัง ให้ซ่อน <video> (เหลือภาพโปสเตอร์)
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
                priority={false}
              />
            )}
          </div>

          {/* overlays */}
          <span className="absolute left-3 top-3 rounded-full border border-sky-300 bg-sky-100 px-3 py-0.5 text-[11px] font-semibold text-sky-800 shadow-sm">
            {camCode}
          </span>

          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-0.5 text-[11px] font-semibold shadow-sm border ${statusBool
              ? "bg-emerald-50 text-emerald-700 border-emerald-700"
              : "bg-red-50 text-red-700 border-red-700"
              }`}
          >
            {statusLabel}
          </span>

          <span className="absolute left-3 bottom-3 inline-flex max-w-[75%] items-center gap-2 truncate rounded-full border bg-white/90 px-3 py-1 text-sm text-gray-700 shadow">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="truncate">{locationName}</span>
          </span>
        </div>

        {/* Info under media */}
        <div className="mt-4">
          <h3 className="text-base font-semibold text-[var(--color-primary)]">
            {cam.name}
          </h3>

          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              <Anchor className="h-4 w-4" />
              {typeLabel}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              <Video className="h-4 w-4" />
              Health: {healthText}
            </span>
          </div>



          <BottomCameraCard camId={cam.id} iconSet="lucide" className="mt-4" />

        </div>
      </div>
    </div>
  );
}