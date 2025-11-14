"use client";

import React from "react";
import {
  Camera as CameraIcon,
  Move,
  Scan,
  Thermometer,
} from "lucide-react";

/* ----------------------------- Types & Maps ----------------------------- */
export type CameraTypeKey = "fixed" | "ptz" | "panoramic" | "thermal" | string;

export const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  fixed: CameraIcon,
  ptz: Move,
  panoramic: Scan,
  thermal: Thermometer,
};

export const TYPE_STYLES: Record<string, { badge: string; icon: string }> = {
  fixed:     { badge: "border-blue-200 bg-blue-50 text-blue-700",     icon: "text-blue-600" },
  ptz:       { badge: "border-amber-200 bg-amber-50 text-amber-700",  icon: "text-amber-600" },
  panoramic: { badge: "border-violet-200 bg-violet-50 text-violet-700", icon: "text-violet-600" },
  thermal:   { badge: "border-orange-200 bg-orange-50 text-orange-700", icon: "text-orange-600" },
  default:   { badge: "border-slate-200 bg-slate-50 text-slate-700",  icon: "text-slate-600" },
};

/* -------------------------------- Helpers ------------------------------- */
export function getTypeIcon(typeKey?: string | null) {
  const k = (typeKey ?? "").toLowerCase();
  return TYPE_ICON[k] ?? CameraIcon;
}

export function getTypeStyle(typeKey?: string | null) {
  const k = (typeKey ?? "").toLowerCase();
  return TYPE_STYLES[k] ?? TYPE_STYLES.default;
}

function toLabel(typeKey?: string | null) {
  const k = (typeKey ?? "").trim();
  if (!k) return "Fixed";
  // Uppercase first letter only
  return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
}

/* --------------------------- BadgeCameraType ---------------------------- */
type BadgeCameraTypeProps = {
  /** ชื่อประเภทกล้อง เช่น fixed | ptz | panoramic | thermal */
  type?: CameraTypeKey | null;
  /** override ข้อความที่แสดงบน badge */
  label?: string;
  /** tailwind class เพิ่มเติม */
  className?: string;
  /** กำหนดขนาด: sm | md */
  size?: "sm" | "md";
  /** class สำหรับไอคอน */
  iconClassName?: string;
};

export default function BadgeCameraType({
  type,
  label,
  className = "",
  size = "md",
  iconClassName = "",
}: BadgeCameraTypeProps) {
  const Icon = getTypeIcon(type);
  const style = getTypeStyle(type);
  const text = label ?? toLabel(type);

  const sizeBadge =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-3 py-1 text-sm";

  const sizeIcon =
    size === "sm"
      ? "h-3.5 w-3.5"
      : "h-4 w-4";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium shadow-sm ${style.badge} ${sizeBadge} ${className}`}
      title={text}
    >
      <Icon className={`${sizeIcon} ${style.icon} ${iconClassName}`} />
      {text}
    </span>
  );
}