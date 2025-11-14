"use client";

import * as React from "react";
import * as Lucide from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera } from "@/app/models/cameras.model";
import DynamicLucideIcon from "@/app/components/Utilities/DynamicLucide";

/* =============== Severity styles (no icons) =============== */
const SEVERITY_STYLES = {
  critical: { pill: "bg-rose-50 text-rose-700 ring-rose-200" },
  high: { pill: "bg-orange-50 text-orange-700 ring-orange-200" },
  medium: { pill: "bg-yellow-50 text-yellow-700 ring-yellow-200" },
  low: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  default: { pill: "bg-slate-50 text-slate-700 ring-slate-200" },
} as const;
type LevelKey = keyof typeof SEVERITY_STYLES;

type UiLevel = "Critical" | "High" | "Medium" | "Low";
type ApiLevel = "critical" | "high" | "medium" | "low";

type EventRow = {
  /** ใช้เป็น :cds_id ใน URL */
  id: number; // detection_id
  name: string;
  evt_icon?: string; // lucide component name (PascalCase)
  sensitivity: UiLevel;
  priority: UiLevel;
  status: boolean;
};

/* ================== Icon mapping ================== */
const ICON_ALIASES: Record<string, string> = {
  motion: "Move",
  "shield-alert": "ShieldAlert",
  "camera-off": "CameraOff",
  "wifi-off": "WifiOff",
  move: "Move",
  activity: "Activity",
  shieldalert: "ShieldAlert",
  cameraoff: "CameraOff",
  wifioff: "WifiOff",
};
function normalizeIconName(raw?: string): string | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().replace(/[\s_]+/g, "-");
  if (ICON_ALIASES[key]) return ICON_ALIASES[key];
  const pascal = key.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  return pascal;
}
function LucideByName({ name, className }: { name?: string; className?: string }) {
  const Fallback = Lucide.CircleDot;
  if (!name) return <Fallback className={className} />;
  const Cmp = (Lucide as Record<string, any>)[name];
  return Cmp ? <Cmp className={className} /> : <Fallback className={className} />;
}

function levelKey(v: string): LevelKey {
  const k = v.toLowerCase() as LevelKey;
  return (SEVERITY_STYLES[k] ? k : "default") as LevelKey;
}
function SeverityPill({ value }: { value: UiLevel }) {
  const key = levelKey(value);
  const { pill } = SEVERITY_STYLES[key];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${pill}`}>
      {value}
    </span>
  );
}
const OPTIONS: UiLevel[] = ["Critical", "High", "Medium", "Low"];

const toApiLevel = (v: UiLevel): ApiLevel => v.toLowerCase() as ApiLevel;
const toUiLevel = (v?: string): UiLevel => {
  const m = (v ?? "low").toLowerCase();
  if (m === "critical") return "Critical";
  if (m === "high") return "High";
  if (m === "medium") return "Medium";
  return "Low";
};

type ApiRow = {
  detection_id: number;               // ใช้เป็น cds_id
  detection_event_id: number;
  event_name: string;
  event_icon?: string;                // e.g. "motion", "shield-alert"
  camera_id: number;
  detection_sensitivity: ApiLevel;
  detection_priority: ApiLevel;
  detection_updated_date: string;
  detection_updated_time: string;
  detection_status: boolean;
};

export default function EventDetectionTable({ camera }: { camera: Camera }) {
  const camId = Number(camera?.camera_id ?? 0);

  const [events, setEvents] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string>("");
  const [savingId, setSavingId] = React.useState<number | null>(null); // ล็อกคอนโทรลขณะอัปเดต

  React.useEffect(() => {
    if (!Number.isFinite(camId) || camId <= 0) {
      setErr("Invalid camera id.");
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`/api/cameras/${camId}/event-detections`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

        const rows: ApiRow[] = Array.isArray(json?.data) ? json.data : [];

        const mapped: EventRow[] = rows.map((r) => ({
          id: r.detection_id,
          name: r.event_name,
          evt_icon: normalizeIconName(r.event_icon),
          sensitivity: toUiLevel(r.detection_sensitivity),
          priority: toUiLevel(r.detection_priority),
          status: !!r.detection_status,
        }));

        if (mounted) setEvents(mapped);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load event detections");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [camId]);

  /** PUT ไปอัปเดตทีละแถว (optimistic) */
  async function putRowUpdate(cds_id: number, patch: Partial<{ sensitivity: UiLevel; priority: UiLevel; status: boolean }>) {
    // รวมค่าปัจจุบัน + patch แล้วส่งให้ backend
    const current = events.find(e => e.id === cds_id);
    if (!current) return;

    const body = {
      detection_sensitivity: toApiLevel(patch.sensitivity ?? current.sensitivity),
      detection_priority: toApiLevel(patch.priority ?? current.priority),
      detection_status: typeof patch.status === "boolean" ? patch.status : current.status,
    };

    setSavingId(cds_id);
    try {
      const res = await fetch(`/api/cameras/event-detections/${cds_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
    } finally {
      setSavingId(null);
    }
  }

  /** อัปเดตค่าใน state + call API (rollback ถ้า fail) */
  const updateOptimistic = async (id: number, field: keyof EventRow, value: any) => {
    const prev = events;
    const next = prev.map(ev => (ev.id === id ? { ...ev, [field]: value } : ev));
    setEvents(next);

    try {
      if (field === "sensitivity") {
        await putRowUpdate(id, { sensitivity: value as UiLevel });
      } else if (field === "priority") {
        await putRowUpdate(id, { priority: value as UiLevel });
      } else if (field === "status") {
        await putRowUpdate(id, { status: !!value });
      }
    } catch (e: any) {
      // rollback
      setEvents(prev);
      alert(e?.message || "Update failed");
    }
  };

  return (
    <div className="w-full">
      {loading && <p className="text-sm text-slate-500 mb-2">Loading event detections…</p>}
      {err && !loading && <p className="text-sm text-red-600 mb-2">{err}</p>}

      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur">
          <TableRow>
            <TableHead className="w-[46%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
              Event
            </TableHead>
            <TableHead className="w-[18%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
              Sensitivity
            </TableHead>
            <TableHead className="w-[18%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
              Alert Priority
            </TableHead>
            <TableHead className="w-[18%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {events.map((ev) => {
            const disabled = savingId === ev.id; // ล็อกเฉพาะแถวที่กำลังบันทึก
            return (
              <TableRow key={ev.id} className="hover:bg-slate-50/60">
                {/* Event */}
                <TableCell>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 grid place-items-center h-9 w-9 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
                      <DynamicLucideIcon name={ev.evt_icon} className="w-4 h-4 text-[var(--color-primary)]" />
                    </span>
                    <span className="text-sm text-slate-800 truncate">{ev.name}</span>
                  </div>
                </TableCell>

                {/* Sensitivity */}
                <TableCell>
                  <Select
                    value={ev.sensitivity}
                    onValueChange={(v) => updateOptimistic(ev.id, "sensitivity", v as UiLevel)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-fit p-0 border-0 bg-transparent shadow-none focus:ring-0 focus:outline-none focus:border-0">
                      <div className="py-1">
                        <SelectValue placeholder="Select sensitivity">
                          <SeverityPill value={ev.sensitivity} />
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="min-w-[9rem]">
                      {OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          <span className="block">
                            <SeverityPill value={opt} />
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Select
                    value={ev.priority}
                    onValueChange={(v) => updateOptimistic(ev.id, "priority", v as UiLevel)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-fit p-0 border-0 bg-transparent shadow-none focus:ring-0 focus:outline-none focus:border-0">
                      <div className="py-1">
                        <SelectValue placeholder="Select priority">
                          <SeverityPill value={ev.priority} />
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="min-w-[9rem]">
                      {OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          <span className="block">
                            <SeverityPill value={opt} />
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="flex items-center">
                    <Switch
                      checked={ev.status}
                      onCheckedChange={(v) => updateOptimistic(ev.id, "status", v)}
                      disabled={disabled}
                      className="[--track:theme(colors.slate.300)] data-[state=checked]:[--track:var(--color-primary)]"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      {ev.status ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {!loading && !err && events.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-slate-500">
                No events found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}