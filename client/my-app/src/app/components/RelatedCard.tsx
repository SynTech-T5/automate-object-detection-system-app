"use client";
import { Clock, MoveUpRight , Speech } from "lucide-react";

const severityStyles: Record<
  "Critical" | "High" | "Medium" |   "Low",
  { text: string; border: string; bg: string }
> = {
  Critical: {
    text: "text-red-600",
    border: "border-red-600",
    bg: "bg-red-100",
  },
  High: {
    text: "text-yellow-600",
    border: "border-yellow-600",
    bg: "bg-yellow-100",
  },
  Medium: {
    text: "text-blue-600",
    border: "border-blue-600",
    bg: "bg-blue-100",
  },
  Low: {
    text: "text-green-600",
    border: "border-green-600",
    bg: "bg-green-100",
  },
};

export default function RelatedCard({
  id = "AL00123",
  severity = "Low",
  message = "Sound Detecting",
  time = "03-06-2025 10:15:00",
}) {
const styles = severityStyles[severity as keyof typeof severityStyles];

  return (
    <div className="flex items-center justify-between border rounded-lg p-3 shadow-sm bg-white">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[16px] text-gray-600">{id}</span>

        {/* Severity Badge */}
        <span
          className={`w-24 text-center text-[16px]  text-xs font-semibold rounded-md border ${styles.text} ${styles.border} ${styles.bg}`}
        >
          {severity}
        </span>

        {/* Message */}
        <div className="flex items-center text-[16px] gap-1 text-sm text-gray-800">
            <Speech className="w-4 h-4"/>
            <span>{message}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center text-[16px] text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {time}
        </div>
        <button className="flex items-center text-[16px] gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition">
          <MoveUpRight className="w-4 h-4"/><span> View </span>
        </button>
      </div>
    </div>
  );
}
