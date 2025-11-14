"use client";

import React from "react";
import {
  ClipboardCheck,
  Wrench,
  Hammer,
  ArrowUpCircle,
  RefreshCw,
  Search,
  Settings,
  Activity,
  MinusCircle,
} from "lucide-react";

/* -------------------- Props -------------------- */
type MaintenanceTypeBadgeProps = {
  name: string | null | undefined;
  date?: string | Date | null | undefined;
  className?: string;
};

/* -------------------- Color / Icon Map -------------------- */
const TYPE_META: Record<string, { icon: React.ReactNode; label: string; classes: string }> = {
  "routine check": {
    icon: <ClipboardCheck className="h-4 w-4" />,
    label: "Routine Check",
    classes: "border border-blue-300 text-blue-700 bg-blue-50",
  },
  repair: {
    icon: <Wrench className="h-4 w-4" />,
    label: "Repair",
    classes: "border border-red-300 text-red-700 bg-red-50",
  },
  installation: {
    icon: <Hammer className="h-4 w-4" />,
    label: "Installation",
    classes: "border border-emerald-300 text-emerald-700 bg-emerald-50",
  },
  upgrade: {
    icon: <ArrowUpCircle className="h-4 w-4" />,
    label: "Upgrade",
    classes: "border border-purple-300 text-purple-700 bg-purple-50",
  },
  replacement: {
    icon: <RefreshCw className="h-4 w-4" />,
    label: "Replacement",
    classes: "border border-orange-300 text-orange-700 bg-orange-50",
  },
  inspection: {
    icon: <Search className="h-4 w-4" />,
    label: "Inspection",
    classes: "border border-amber-300 text-amber-700 bg-amber-50",
  },
  configuration: {
    icon: <Settings className="h-4 w-4" />,
    label: "Configuration",
    classes: "border border-teal-300 text-teal-700 bg-teal-50",
  },
  "no maintenance": {
    icon: <MinusCircle className="h-4 w-4" />,
    label: "Not Maintained",
    classes: "border border-gray-300 text-gray-700 bg-gray-50",
  },
};

/* -------------------- Utils -------------------- */
function formatISODate(dateInput?: string | Date | null) {
  if (!dateInput) return null;
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // 2025-09-11
}

/* -------------------- Component -------------------- */
export function MaintenanceTypeBadge({ name, date, className = "" }: MaintenanceTypeBadgeProps) {
  const key = (name ?? "").trim().toLowerCase() || "no maintenance";
  const meta = TYPE_META[key] ?? TYPE_META["no maintenance"];
  const dateText = formatISODate(date);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${meta.classes} ${className}`}
    >
      {meta.icon}
      <span>{meta.label}</span>
      {dateText && <span className="opacity-80 text-xs">{dateText}</span>}
    </span>
  );
}

export default MaintenanceTypeBadge;