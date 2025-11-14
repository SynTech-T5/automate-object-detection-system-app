// components/Utilities/StatusMessage.tsx
"use client";

import * as Icons from "lucide-react";
import React from "react";

export type StatusType = "success" | "error" | "info";

interface StatusMessageProps {
  message?: string | null;
  status?: StatusType | null;
  className?: string;
}

export function StatusMessage({ message, status = "info", className }: StatusMessageProps) {
  if (!message) return null;

  let colorClass = "";
  let Icon = Icons.Info;

  switch (status) {
    case "error":
      colorClass = "bg-rose-50 text-rose-700 ring-rose-200";
      Icon = Icons.AlertCircle;
      break;
    case "success":
      colorClass = "bg-emerald-50 text-emerald-700 ring-emerald-200";
      Icon = Icons.BadgeCheck;
      break;
    case "info":
      colorClass = "bg-sky-50 text-sky-700 ring-sky-200";
      Icon = Icons.Info;
      break;
    default:
      colorClass = "bg-gray-50 text-gray-700 ring-gray-200";
      Icon = Icons.Info;
      break;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 text-sm ${colorClass} ${className || ""}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
