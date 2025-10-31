"use client";

import {
  User as UserIcon,
  MonitorCog,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import React from "react";

type UserBadgeProps = {
  username?: string | null;
  role?: string | null;
  className?: string;
};

/**
 * แสดง badge ชื่อผู้ใช้พร้อมไอคอนและสีตาม role
 * - System → ม่วง + MonitorCog
 * - Admin → แดง + ShieldAlert
 * - Security Team → เหลือง + ShieldCheck
 * - Staff → น้ำเงิน + Wrench
 * - อื่น ๆ → เขียว (ดีฟอลต์) + User
 */
export default function UserBadge({
  username,
  role,
  className = "",
}: UserBadgeProps) {
  const name = (username ?? "").trim() || "unknown";
  const roleName = (role ?? "").toLowerCase();

  let palette = {
    border: "border-emerald-300",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: "text-emerald-700",
    iconComponent: <UserIcon className="h-4 w-4 text-emerald-700" />,
  };

  switch (roleName) {
    case "system":
      palette = {
        border: "border-purple-300",
        text: "text-purple-700",
        bg: "bg-purple-50",
        icon: "text-purple-700",
        iconComponent: <MonitorCog className="h-4 w-4 text-purple-700" />,
      };
      break;
    case "admin":
      palette = {
        border: "border-red-300",
        text: "text-red-700",
        bg: "bg-red-50",
        icon: "text-red-700",
        iconComponent: <ShieldAlert className="h-4 w-4 text-red-700" />,
      };
      break;
    case "security team":
      palette = {
        border: "border-amber-300",
        text: "text-amber-700",
        bg: "bg-amber-50",
        icon: "text-amber-700",
        iconComponent: <ShieldCheck className="h-4 w-4 text-amber-700" />,
      };
      break;
    case "staff":
      palette = {
        border: "border-blue-300",
        text: "text-blue-700",
        bg: "bg-blue-50",
        icon: "text-blue-700",
        iconComponent: <Wrench className="h-4 w-4 text-blue-700" />,
      };
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium 
                  border ${palette.border} ${palette.text} ${palette.bg} ${className}`}
    >
      {palette.iconComponent}
      <span className="opacity-80 text-xs">{name}</span>
    </span>
  );
}
