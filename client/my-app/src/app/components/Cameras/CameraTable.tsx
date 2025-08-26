"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar, Trash2, Pencil, CircleAlert,
  // เพิ่มไอคอนที่ใช้กับ Type/Health
  Camera as CameraIcon, Move, Scan, Thermometer, Activity,
} from "lucide-react";
import type { Camera } from "./CameraCard";
import * as Icons from "lucide-react";

type SortKey = "id" | "name" | "status" | "location" | "health";
type SortOrder = "asc" | "desc" | null;

type ActionActive = "view" | "edit" | "details" | "delete";
type Props = {
  cameras: Camera[];
  active?: ActionActive;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDetails?: (id: number) => void;
  onDelete?: (id: number) => void;
};

// ---------- TYPE & HEALTH helpers ----------
const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  fixed: CameraIcon,
  ptz: Move,
  panoramic: Scan,
  thermal: Thermometer,
};
function getTypeIcon(typeKey?: string | null) {
  const key = (typeKey ?? "").toLowerCase();
  return TYPE_ICON[key] ?? CameraIcon;
}

const TYPE_STYLES: Record<string, { badge: string; icon: string }> = {
  fixed: { badge: "border-blue-200 bg-blue-50 text-blue-700", icon: "text-blue-600" },
  ptz: { badge: "border-amber-200 bg-amber-50 text-amber-700", icon: "text-amber-600" },
  panoramic: { badge: "border-violet-200 bg-violet-50 text-violet-700", icon: "text-violet-600" },
  thermal: { badge: "border-rose-200 bg-rose-50 text-rose-700", icon: "text-rose-600" },
  default: { badge: "border-slate-200 bg-slate-50 text-slate-700", icon: "text-slate-600" },
};
function getTypeStyle(typeKey?: string | null) {
  const k = (typeKey ?? "").toLowerCase();
  return TYPE_STYLES[k] ?? TYPE_STYLES.default;
}

type HealthText = string | number | null | undefined;
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
function getHealthStyle(health: HealthText) {
  if (health === null || health === undefined || health === "") return HEALTH_STYLES.default;

  const n = Number(health);
  if (!Number.isNaN(n)) {
    if (n >= 90) return HEALTH_STYLES.excellent;
    if (n >= 80) return HEALTH_STYLES.good;
    if (n >= 70) return HEALTH_STYLES.fair;
    if (n >= 60) return HEALTH_STYLES.degraded;
    if (n > 0) return HEALTH_STYLES.poor;
    return HEALTH_STYLES.offline;
  }

  const key = String(health).toLowerCase();
  if (["excellent", "very good", "ยอดเยี่ยม"].includes(key)) return HEALTH_STYLES.excellent;
  if (["good", "healthy", "ดี"].includes(key)) return HEALTH_STYLES.good;
  if (["fair", "moderate", "พอใช้"].includes(key)) return HEALTH_STYLES.fair;
  if (["degraded", "warning", "เตือน"].includes(key)) return HEALTH_STYLES.degraded;
  if (["poor", "bad", "แย่"].includes(key)) return HEALTH_STYLES.poor;
  if (["critical", "วิกฤติ"].includes(key)) return HEALTH_STYLES.critical;
  if (["offline", "down", "ออฟไลน์"].includes(key)) return HEALTH_STYLES.offline;

  return HEALTH_STYLES.default;
}
// ------------------------------------------

// แปลงค่าจาก query เป็น boolean | null
function parseStatusParam(v: string | null): boolean | null {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (s === "active" || s === "true" || s === "1") return true;
  if (s === "inactive" || s === "false" || s === "0") return false;
  return null;
}

export default function CameraTable({
  cameras,
  active,
  onView,
  onEdit,
  onDetails,
  onDelete,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status"); // e.g. "Active" | "Inactive"

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") setSortOrder(null);
      else setSortOrder("asc");
    }
  };

  // ✅ กรองตาม status จาก URL ก่อน (เทียบกับ c.status แบบ boolean)
  const filtered = useMemo(() => {
    const want = parseStatusParam(statusParam);
    if (want === null) return cameras;
    return cameras.filter((c) => !!c.status === want);
  }, [cameras, statusParam]);

  const getVal = (c: Camera, key: SortKey) => {
    switch (key) {
      case "id":
        return c.id ?? 0;
      case "name":
        return c.name ?? "";
      case "status":
        return c.status ? 1 : 0;
      case "location":
        return c.location?.name ?? "";
      case "health":
        return c.health ?? 0;
      default:
        return "";
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortOrder) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const A = getVal(a, sortKey) as any;
      const B = getVal(b, sortKey) as any;
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  if (!filtered.length) {
    return (
      <div className="text-sm text-gray-500">
        {cameras?.length ? "No cameras match this status filter." : "No cameras to display."}
      </div>
    );
  }

  return (
    <Table className="table-auto w-full">
      <TableHeader>
        <TableRow className="border-b border-[var(--color-primary)]">
          <TableHead onClick={() => handleSort("id")} className="cursor-pointer select-none text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>ID</span>
              {renderSortIcon("id")}
            </div>
          </TableHead>

          <TableHead onClick={() => handleSort("name")} className="cursor-pointer select-none text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>Name</span>
              {renderSortIcon("name")}
            </div>
          </TableHead>

          <TableHead onClick={() => handleSort("location")} className="cursor-pointer select-none text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>Location</span>
              {renderSortIcon("location")}
            </div>
          </TableHead>

          <TableHead className="text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>Type</span>
            </div>
          </TableHead>

          <TableHead onClick={() => handleSort("status")} className="cursor-pointer select-none text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>Status</span>
              {renderSortIcon("status")}
            </div>
          </TableHead>

          <TableHead onClick={() => handleSort("health")} className="cursor-pointer select-none text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>Health</span>
              {renderSortIcon("health")}
            </div>
          </TableHead>

          <TableHead className="text-[var(--color-primary)]">
            <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
              <span>Last Maintenance</span>
            </div>
          </TableHead>

          <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {sorted.map((c) => {
          const camCode = `CAM${String(c.id).padStart(3, "0")}`;
          const statusLabel = c.status ? "Active" : "Inactive";

          // Badge สำหรับ Type
          const TypeIcon = getTypeIcon(c.type);
          const typeStyle = getTypeStyle(c.type);

          // Badge สำหรับ Health
          const healthStyle = getHealthStyle(c.health);
          const healthLabel =
            c.health == null ? "-" : (typeof c.health === "number" ? `${c.health}%` : String(c.health));

          return (
            <TableRow key={c.id} className="border-b last:border-b-0">
              <TableCell>{camCode}</TableCell>

              <TableCell className="font-medium truncate max-w-[320px]">
                <div className="flex items-center gap-2">
                  <Icons.Camera className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <span>{c.name}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <span className="truncate max-w-[260px]">{c.location?.name ?? "-"}</span>
                </div>
              </TableCell>

              {/* TYPE: badge + icon + สี */}
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${typeStyle.badge}`}
                >
                  <TypeIcon className={`w-3.5 h-3.5 ${typeStyle.icon}`} />
                  <span className="capitalize">{c.type || "fixed"}</span>
                </span>
              </TableCell>

              {/* STATUS: คงเดิม */}
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.status ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}
                >
                  {c.status ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {statusLabel}
                </span>
              </TableCell>

              {/* HEALTH: badge + icon + สี */}
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${healthStyle.badge}`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  {healthLabel}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  {(() => {
                    const date = (c as any).last_maintenance_date as string | undefined;
                    const time = (c as any).last_maintenance_time as string | undefined;
                    const combined = `${date ?? ""} ${time ?? ""}`.trim();
                    const showDash =
                      !combined ||
                      combined === "1970-01-01 07:00:00" ||
                      (date === "1970-01-01" && (!time || time.startsWith("07:00")));
                    const label = showDash ? "-" : combined;
                    return <span className="truncate max-w-[260px]">{label}</span>;
                  })()}
                </div>
              </TableCell>

              <TableCell className="min-w-[220px]">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => (onView ? onView(c.id) : router.push(`/cameras/${c.id}`))}
                    title="View"
                    aria-label="View"
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => (onEdit ? onEdit(c.id) : router.push(`/cameras/${c.id}/edit`))}
                    title="Edit"
                    aria-label="Edit"
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => (onDetails ? onDetails(c.id) : router.push(`/cameras/${c.id}?tab=details`))}
                    title="Details"
                    aria-label="Details"
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <CircleAlert className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (onDelete) return onDelete(c.id);
                      if (!confirm("ลบกล้องนี้?")) return;
                      try {
                        setBusyId(c.id);
                        const res = await fetch(`/api/cameras/${c.id}`, { method: "DELETE" });
                        if (!res.ok) throw new Error("Delete failed");
                        router.refresh();
                      } catch (e) {
                        alert((e as Error).message || "Delete failed");
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    title="Delete"
                    aria-label="Delete"
                    disabled={busyId === c.id}
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:border-[var(--color-danger)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}