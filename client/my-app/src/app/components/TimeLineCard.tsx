"use client";
import { BellRing, Clock } from "lucide-react";

export default function TimeLineCard({
  title = "Alert Generated",
  message = "aeiou",
  timestamp = "03-06-2025 09:45:22",
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg shadow-md border border-gray-200 bg-white">
      {/* Icon */}
      <div className="flex-shrink-0 text-[var(--color-primary)]">
        <BellRing className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-[var(--color-primary)] text-sm">
          {title}
        </h3>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>

      {/* Timestamp */}
      <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
        <Clock className="w-3 h-3 mr-1" />
        {timestamp}
      </div>
    </div>
  );
}
