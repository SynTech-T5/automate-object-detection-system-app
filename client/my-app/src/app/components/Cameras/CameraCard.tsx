"use client";

import Image from "next/image";
import { MapPin, Camera as CameraIcon, Move, Scan, Thermometer, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import WhepPlayer from "../../components/WhepPlayer";
import BottomCameraCard from "@/app/components/Utilities/ButtonCameraCard";
import { Camera } from "@/app/models/cameras.model";
import { MaintenanceTypeBadge } from "../Badges/MaintenanceTypeBadge"
import BadgeError from "../Badges/BadgeError";

// ---------- helpers (เฉพาะที่ใช้งานจริง) ----------
const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  fixed: CameraIcon,
  ptz: Move,
  panoramic: Scan,
  thermal: Thermometer,
};
const TYPE_STYLES: Record<string, { badge: string; icon: string }> = {
  fixed: { badge: "border-blue-200 bg-blue-50 text-blue-700", icon: "text-blue-600" },
  ptz: { badge: "border-amber-200 bg-amber-50 text-amber-700", icon: "text-amber-600" },
  panoramic: { badge: "border-violet-200 bg-violet-50 text-violet-700", icon: "text-violet-600" },
  thermal: { badge: "border-orange-200 bg-orange-50 text-orange-700", icon: "text-orange-600" },
  default: { badge: "border-slate-200 bg-slate-50 text-slate-700", icon: "text-slate-600" },
};
const HEALTH_STYLES = {
  excellent: { badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  good: { badge: "border-green-200 bg-green-50 text-green-700" },
  fair: { badge: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  degraded: { badge: "border-orange-200 bg-orange-50 text-orange-700" },
  poor: { badge: "border-amber-200 bg-amber-50 text-amber-700" },
  critical: { badge: "border-red-200 bg-red-50 text-red-700" },
  offline: { badge: "border-slate-200 bg-slate-100 text-slate-700" },
  default: { badge: "border-slate-200 bg-slate-50 text-slate-700" },
} as const;

function getTypeIcon(typeKey?: string | null) {
  const k = (typeKey ?? "").toLowerCase();
  return TYPE_ICON[k] ?? CameraIcon;
}
function getTypeStyle(typeKey?: string | null) {
  const k = (typeKey ?? "").toLowerCase();
  return TYPE_STYLES[k] ?? TYPE_STYLES.default;
}
function getHealthStyle(h: number | string | null | undefined) {
  if (h === null || h === undefined || h === "") return HEALTH_STYLES.default;
  const n = Number(h);
  if (!Number.isNaN(n)) {
    if (n >= 90) return HEALTH_STYLES.excellent;
    if (n >= 80) return HEALTH_STYLES.good;
    if (n >= 70) return HEALTH_STYLES.fair;
    if (n >= 60) return HEALTH_STYLES.degraded;
    if (n > 0) return HEALTH_STYLES.poor;
    return HEALTH_STYLES.offline;
  }
  const key = String(h).toLowerCase();
  if (["excellent", "very good", "ยอดเยี่ยม"].includes(key)) return HEALTH_STYLES.excellent;
  if (["good", "healthy", "ดี"].includes(key)) return HEALTH_STYLES.good;
  if (["fair", "moderate", "พอใช้"].includes(key)) return HEALTH_STYLES.fair;
  if (["degraded", "warning", "เตือน"].includes(key)) return HEALTH_STYLES.degraded;
  if (["poor", "bad", "แย่"].includes(key)) return HEALTH_STYLES.poor;
  if (["critical", "วิกฤติ"].includes(key)) return HEALTH_STYLES.critical;
  if (["offline", "down", "ออฟไลน์"].includes(key)) return HEALTH_STYLES.offline;
  return HEALTH_STYLES.default;
}

// ---------- component ----------
export default function CameraCard({ cam }: { cam: Camera }) {
  const isOnline = !!cam.camera_status;
  const imageSrc = (cam as any).cam_image ?? (cam as any).image_url ?? (cam as any).thumbnail ?? "/library-room.jpg";

  const camCode = `CAM${String(cam.camera_id).padStart(3, "0")}`;
  const locationName = cam.location_name ?? "-";
  const TypeIcon = getTypeIcon(cam.camera_type);
  const typeStyle = getTypeStyle(cam.camera_type);

  const WHEP_BASE = process.env.NEXT_PUBLIC_WHEP_BASE ?? "http://localhost:8889";
  const isRtsp = typeof cam.source_value === "string" && cam.source_value.startsWith("rtsp://");

  const [webrtcFailed, setWebrtcFailed] = useState(false);
  useEffect(() => { setWebrtcFailed(false); }, []);
  useEffect(() => setWebrtcFailed(false), [cam.camera_id, cam.source_value]);

  const camBorder   = isOnline ? "border-[var(--color-primary)]"     : "border-[var(--color-danger)]";
  const camHeaderBG = isOnline ? "bg-[var(--color-primary-bg)] border border-[var(--color-primary)]"
                               : "bg-[var(--color-danger-bg)] border border-[var(--color-danger)]";
  const camIconRing = isOnline ? "border-[var(--color-primary)]"     : "border-[var(--color-danger)]";
  const camIconBG   = isOnline ? "bg-[var(--color-primary)]"         : "bg-[var(--color-danger)]";

  return (
    <div className="relative mt-12">
      {/* Top background */}
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 -top-7 h-16 rounded-2xl ${camHeaderBG} shadow-sm z-0`} />

      {/* Floating icon */}
      <div className="absolute left-1/2 -top-4 -translate-x-1/2 z-20">
        <div className={`grid place-items-center h-10 w-10 rounded-full bg-white ${camIconRing} shadow`}>
          <div className={`grid place-items-center h-8 w-8 rounded-full ${camIconBG} ring-2 ring-white`}>
            <CameraIcon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Card */}
      <div className={`relative z-10 rounded-xl border ${camBorder} bg-[var(--color-white)] shadow-sm p-4 overflow-hidden`}>
        {/* Media */}
        <div className="relative overflow-hidden rounded-md">
          <div className="relative aspect-video">
            {isOnline && isRtsp && !webrtcFailed ? (
              <WhepPlayer
                key={cam.camera_id}
                camAddressRtsp={cam.source_value}
                webrtcBase={WHEP_BASE}
                onFailure={() => setWebrtcFailed(true)}  // เงียบ ๆ แล้วเป็นรูปแทน
              />
            ) : isOnline ? (
              <Image
                src={imageSrc}
                alt={cam.camera_name}
                fill
                className="absolute inset-0 h-full w-full object-cover rounded-md"
                sizes="(min-width: 1024px) 400px, 100vw"
              />
            ) : (
              <Image
                src="/blind.svg"
                alt="Camera offline"
                fill
                className="absolute inset-0 h-full w-full object-cover rounded-md"
                sizes="(min-width: 1024px) 400px, 100vw"
              />
            )}
          </div>

          {/* overlays */}
          <span className="absolute left-3 top-3 rounded-full border border-sky-300 bg-sky-100 px-3 py-0.5 text-[11px] font-semibold text-sky-800 shadow-sm">
            {camCode}
          </span>

          <span className={`absolute right-3 top-3 rounded-full px-3 py-0.5 text-[11px] font-semibold shadow-sm border ${
            isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-700" : "bg-red-50 text-red-700 border-red-700"
          }`}>
            {isOnline ? "Active" : "Inactive"}
          </span>

          <span className="absolute left-3 bottom-3 inline-flex max-w-[75%] items-center gap-2 truncate rounded-full border bg-white/90 px-3 py-1 text-sm text-gray-700 shadow">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="truncate">{locationName}</span>
          </span>
        </div>

        {/* Info */}
        <div className="mt-4">
          <h3 className="text-base font-semibold text-[var(--color-primary)]">{cam.camera_name}</h3>

          <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${typeStyle.badge}`}>
                <TypeIcon className={`h-4 w-4 ${typeStyle.icon}`} />
                {cam.camera_type || "Fixed"}
              </span>

            <MaintenanceTypeBadge name={cam.maintenance_type} date={cam.date_last_maintenance} />
          </div>

          {cam.camera_status ? "" : (
            <div className="mt-1 flex items-center justify-between text-sm font-medium text-gray-700">
              <span className="mr-2">Cause:</span>
              <BadgeError reason="Connection Timeout" />
              {/* <BadgeError reason="Unknown" />
              <BadgeError reason="Critical Failure" />
              <BadgeError reason="Server Down" />
              <BadgeError reason="Power Failure" />
              <BadgeError reason="Network Error" /> */}
            </div>
          )}

          <BottomCameraCard camId={cam.camera_id} camName={cam.camera_name} iconSet="lucide" className="mt-4" />
        </div>
      </div>
    </div>
  );
}