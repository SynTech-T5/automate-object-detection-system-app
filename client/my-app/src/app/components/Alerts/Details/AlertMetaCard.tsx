"use client";

import { Camera, MapPin, Clock3, User, FileVideo } from "lucide-react";
import DynamicLucideIcon from "@/app/components/Utilities/DynamicLucide"; // ปรับพาธให้ตรงโปรเจกต์คุณ
import { TriangleAlert, CircleAlert, Minus, ArrowDown } from "lucide-react";

type Props = {
  alert: any;
  title?: string;
};

/* ---------- helpers ---------- */
function formatDateTimeISO(iso?: string, tz = "Asia/Bangkok") {
  if (!iso) return "-";
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(d);
  return `${date} ${time}`;
}

function SeverityBadge({ value }: { value?: string }) {
  const v = (value ?? "").toLowerCase();
  const map: Record<string, { cls: string; Icon: any; label: string }> = {
    critical: { cls: "bg-rose-50 text-rose-700 ring-rose-200", Icon: TriangleAlert, label: "Critical" },
    high:     { cls: "bg-orange-50 text-orange-700 ring-orange-200", Icon: CircleAlert,   label: "High" },
    medium:   { cls: "bg-yellow-50 text-yellow-700 ring-yellow-200", Icon: Minus,          label: "Medium" },
    low:      { cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: ArrowDown,   label: "Low" },
  };
  const { cls, Icon, label } = map[v] ?? { cls: "bg-slate-50 text-slate-700 ring-slate-200", Icon: CircleAlert, label: value ?? "Unknown" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> <span className="capitalize">{label}</span>
    </span>
  );
}

function StatusBadge({ value }: { value?: string }) {
  const v = (value ?? "").toLowerCase();
  const cls =
    v === "active"    ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
    v === "resolved"  ? "bg-sky-50 text-sky-700 ring-sky-200" :
    v === "dismissed" ? "bg-rose-50 text-rose-700 ring-rose-200" :
                        "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* ---------- component ---------- */
export default function AlertMetaCard({ alert, title = "Alert Details" }: Props) {
  const alertId      = Number(alert?.alert_id ?? alert?.id ?? 0);
  const alrCode      = `ALR${String(alertId).padStart(3, "0")}`;
  const fgtCode      = alert?.footage_id != null ? `FGT${String(alert?.footage_id).padStart(3, "0")}` : "-";

  const createdAt    = alert?.created_at;
  const status       = alert?.alert_status;
  const severity     = alert?.severity;
  const description  = alert?.alert_description;
  const reason       = alert?.alert_reason;
  const camName      = alert?.camera_name;
  const locName      = alert?.location_name;
  const eventName    = alert?.event_name;
  const eventIcon    = alert?.event_icon;   // เช่น "motion"

  const isActive = String(status ?? "").toLowerCase() === "active";

  return (
    <div className="rounded-lg border bg-white border-[var(--color-primary-bg)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-primary-bg)]">
        <div className="flex items-center justify-between gap-3">
          {/* ซ้าย: Event icon + Event name */}
          <div className="flex items-center gap-2 min-w-0">
            <DynamicLucideIcon
              name={eventIcon || eventName}
              fallback="Bell"
              className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm text-gray-500 leading-tight">{title}</div>
              <div className="font-semibold text-[var(--color-primary)] truncate">{eventName ?? "-"}</div>
            </div>
          </div>

          {/* ขวา: รหัส + Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-white border border-gray-200 text-gray-700">
              {alrCode}
            </span>
            <SeverityBadge value={severity} />
            <StatusBadge value={status} />
          </div>
        </div>
      </div>

      {/* Body: แบ่ง 2 ฝั่ง */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Created At</div>
              <div className="font-medium text-gray-800 flex items-center gap-1">
                <Clock3 className="w-4 h-4 text-[var(--color-primary)]" />
                {formatDateTimeISO(createdAt)}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Camera</div>
              <div className="font-medium text-gray-800 flex items-center gap-1">
                <Camera className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="break-words">{camName ?? "-"}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="font-medium text-gray-800 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="break-words">{locName ?? "-"}</span>
              </div>
            </div>

            {/* Description (หากมี) */}
            {description ? (
              <div>
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <div className="font-medium text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                  {description}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Event</div>
              <div className="font-medium text-gray-800 flex items-center gap-1">
                <DynamicLucideIcon
                  name={eventIcon || eventName}
                  fallback="Bell"
                  className="w-4 h-4 text-[var(--color-primary)]"
                />
                <span className="break-words">{eventName ?? "-"}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Created By</div>
              <div className="font-medium text-gray-800 flex items-center gap-1">
                <User className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="break-words">{alert?.created_by ?? "-"}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Footage ID</div>
              <div className="font-medium text-gray-800 flex items-center gap-1">
                <FileVideo className="w-4 h-4 text-[var(--color-primary)]" />
                {fgtCode}
              </div>
            </div>

            {/* Reason (แสดงเฉพาะเมื่อ status != Active และมี reason) */}
            {!isActive && reason ? (
              <div>
                <div className="text-xs text-gray-500 mb-1">Reason</div>
                <div className="font-medium text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                  {reason}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}