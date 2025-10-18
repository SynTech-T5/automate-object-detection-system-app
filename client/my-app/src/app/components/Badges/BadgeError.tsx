"use client";

import React from "react";
import {
  WifiOff,
  HelpCircle,
  PlugZap,
  Clock,
  ServerCrash,
  AlertTriangle,
} from "lucide-react";

/* -------------------- Props -------------------- */
type BadgeErrorProps = {
  reason: string | null | undefined;
  className?: string;
};

/* -------------------- Error Types -------------------- */
const ERROR_META: Record<
  string,
  { icon: React.ReactNode; label: string; classes: string }
> = {
  "network error": {
    icon: <WifiOff className="h-4 w-4" />,
    label: "Network Error",
    classes: "border border-red-300 text-red-700 bg-red-50",
  },
  unknown: {
    icon: <HelpCircle className="h-4 w-4" />,
    label: "Unknown",
    classes: "border border-gray-300 text-gray-700 bg-gray-50",
  },
  "power failure": {
    icon: <PlugZap className="h-4 w-4" />,
    label: "Power Failure",
    classes: "border border-amber-300 text-amber-700 bg-amber-50",
  },
  "connection timeout": {
    icon: <Clock className="h-4 w-4" />,
    label: "Connection Timeout",
    classes: "border border-orange-300 text-orange-700 bg-orange-50",
  },
  "server down": {
    icon: <ServerCrash className="h-4 w-4" />,
    label: "Server Down",
    classes: "border border-purple-300 text-purple-700 bg-purple-50",
  },
  "critical failure": {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Critical Failure",
    classes: "border border-rose-300 text-rose-700 bg-rose-50",
  },
};

/* -------------------- Component -------------------- */
export function BadgeError({ reason, className = "" }: BadgeErrorProps) {
  const key = (reason ?? "").trim().toLowerCase() || "unknown";
  const meta = ERROR_META[key] ?? ERROR_META.unknown;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${meta.classes} ${className}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

export default BadgeError;
