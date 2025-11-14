// app/components/Alerts/AlertTable.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* ------------------------------ SEVERITY TAGS ------------------------------ */
const SEVERITY_STYLES = {
  critical: { pill: "bg-rose-50 text-rose-700 ring-rose-200", Icon: Icons.TriangleAlert },
  high: { pill: "bg-orange-50 text-orange-700 ring-orange-200", Icon: Icons.CircleAlert },
  medium: { pill: "bg-yellow-50 text-yellow-700 ring-yellow-200", Icon: Icons.Minus },
  low: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: Icons.ArrowDown },
  default: { pill: "bg-slate-50 text-slate-700 ring-slate-200", Icon: Icons.CircleAlert },
} as const;

function SeverityBadge({ value }: { value?: string }) {
  const key = (value ?? "").trim().toLowerCase() as keyof typeof SEVERITY_STYLES;
  const { pill, Icon } = SEVERITY_STYLES[key] ?? SEVERITY_STYLES.default;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* ------------------------------- STATUS TAGS ------------------------------- */
const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  resolved: "bg-sky-50 text-sky-700 ring-sky-200",
  dismissed: "bg-rose-50 text-rose-700 ring-rose-200",
  default: "bg-slate-50 text-slate-700 ring-slate-200",
} as const;

function StatusBadge({ value }: { value?: string }) {
  const key = (value ?? "").trim().toLowerCase() as keyof typeof STATUS_STYLES;
  const pill = STATUS_STYLES[key] ?? STATUS_STYLES.default;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* ------------------------------- TYPES + UTILS ----------------------------- */
export type Alert = {
  id: number;
  severity: string;
  create_date: string;
  create_time: string;
  alert_description?: string;
  camera: { name: string; location: { name: string } };
  event: { name: string; icon?: string };
  status: string;
};

function iconFromName(name?: string) {
  if (!name) return Icons.Bell;
  const pascal = name
    .toString()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return ((Icons as any)[pascal] ?? Icons.Bell) as React.ComponentType<LucideProps>;
}

/* -------------------------------------------------------------------------- */
/*                          ICON BUTTON (GHOST → FULL)                        */
/* -------------------------------------------------------------------------- */
function IconAction({
  label,
  children,
  variant = "primary", // primary | success | danger | info
  onClick,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "info";
  onClick?: () => void;
  className?: string;
}) {
  const palette =
    variant === "success"
      ? {
        border: "border-[var(--color-success,#22c55e)]",
        text: "text-[var(--color-success,#22c55e)]",
        hoverBg: "hover:bg-[var(--color-success,#22c55e)]",
        focusRing: "focus:ring-[var(--color-success,#22c55e)]",
      }
      : variant === "danger"
        ? {
          border: "border-[var(--color-danger,#ef4444)]",
          text: "text-[var(--color-danger,#ef4444)]",
          hoverBg: "hover:bg-[var(--color-danger,#ef4444)]",
          focusRing: "focus:ring-[var(--color-danger,#ef4444)]",
        }
        : variant === "info"
          ? {
            border: "border-[var(--color-info,#0ea5e9)]",
            text: "text-[var(--color-info,#0ea5e9)]",
            hoverBg: "hover:bg-[var(--color-info,#0ea5e9)]",
            focusRing: "focus:ring-[var(--color-info,#0ea5e9)]",
          }
          : {
            border: "border-[var(--color-primary,#3b82f6)]",
            text: "text-[var(--color-primary,#3b82f6)]",
            hoverBg: "hover:bg-[var(--color-primary,#3b82f6)]",
            focusRing: "focus:ring-[var(--color-primary,#3b82f6)]",
          };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={[
              "inline-flex items-center justify-center h-8 w-8 rounded-full",
              "bg-transparent border", palette.border, palette.text,
              palette.hoverBg, "hover:text-white hover:border-transparent",
              "transition focus:outline-none focus:ring-2 focus:ring-offset-2",
              palette.focusRing,
              className,
            ].join(" ")}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 ACTION BAR                                 */
/* -------------------------------------------------------------------------- */
function ActionBar({
  status,
  onView,
  onResolve,
  onDismiss,
}: {
  status: string;
  onView?: () => void;
  onResolve?: () => void;
  onDismiss?: () => void;
}) {
  const isActive = (status ?? "").trim().toLowerCase() === "active";

  return (
    <div className="flex items-center gap-1.5">
      <IconAction label="View" variant="primary" onClick={onView}>
        <Eye className="h-[16px] w-[16px]" aria-hidden="true" />
      </IconAction>

      {isActive && (
        <>
          {/* Resolve = info (ฟ้า) */}
          <IconAction label="Resolve" variant="info" onClick={onResolve}>
            <CheckCircle2 className="h-[16px] w-[16px]" aria-hidden="true" />
          </IconAction>

          {/* Dismiss = danger (แดง) */}
          <IconAction label="Dismiss" variant="danger" onClick={onDismiss}>
            <XCircle className="h-[16px] w-[16px]" aria-hidden="true" />
          </IconAction>
        </>
      )}
    </div>
  );
}

/* ---------------------------------- MAIN TABLE ---------------------------- */
type SortKey =
  | "severity"
  | "id"
  | "timestamp"
  | "camera"
  | "event"
  | "location"
  | "status";

type SortOrder = "asc" | "desc" | null;

type Me = { usr_id: number; usr_username: string; usr_email: string; usr_role?: string };
type PendingAction = { id: number; status: "resolved" | "dismissed" } | null;

export default function AlertTable({ alerts }: { alerts: Alert[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const router = useRouter();

  // เก็บ rows ไว้อัปเดตสถานะแบบทันที
  const [rows, setRows] = useState<Alert[]>(alerts);
  useEffect(() => setRows(alerts), [alerts]);

  // ⬇️ NEW: Pagination state
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);

  // ให้กลับไปหน้า 1 เมื่อมีการเปลี่ยนแปลงข้อมูล/เรียงลำดับ
  useEffect(() => {
    setPage(1);
  }, [rows, sortKey, sortOrder]);

  // me -> ใช้ usr_id ตอนยิง PATCH
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const pendingAlert = useMemo(
    () => (pending ? rows.find(r => r.id === pending.id) ?? null : null),
    [pending, rows]
  );

  const viewAlert = (id: number) =>
    router.push(`/alerts/${encodeURIComponent(String(id))}/details`);

  // เปิด Modal เพื่อกรอกเหตุผล
  function openStatusModal(id: number, status: "resolved" | "dismissed") {
    setPending({ id, status });
    setReason("");
    setOpenModal(true);
  }

  // ยิง PATCH /api/:alr_id/status พร้อม reason + user_id (optimistic update)
  async function submitStatus() {
    if (!pending) return;

    const user_id = me?.usr_id;
    if (!user_id) {
      alert("Please sign in first.");
      return;
    }

    if (!reason.trim()) {
      setReasonError("Please provide a reason.");
      return;
    }

    setReasonError(null);

    const { id, status } = pending;

    // optimistic update
    const prevRows = rows;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    try {
      const res = await fetch(`/api/alerts/${encodeURIComponent(String(id))}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: reason.trim(), user_id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `Failed to set status: ${status}`);

      setOpenModal(false);
      setPending(null);
      setReason("");
    } catch (e: any) {
      // rollback ถ้าพลาด
      setRows(prevRows);
      alert(e?.message || "Update failed");
    }
  }

  const resolveAlert = (id: number) => openStatusModal(id, "resolved");
  const dismissAlert = (id: number) => openStatusModal(id, "dismissed");

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

  const getComparable = (a: Alert, key: SortKey) => {
    switch (key) {
      case "timestamp": return new Date(`${a.create_date} ${a.create_time}`).getTime();
      case "camera": return (a.camera?.name ?? "").toLowerCase();
      case "event": return (a.event?.name ?? "").toLowerCase();
      case "location": return (a.camera?.location?.name ?? "").toLowerCase();
      case "status": return (a.status ?? "").toLowerCase();
      case "severity": return (a.severity ?? "").toLowerCase();
      case "id":
      default: return a.id;
    }
  };

  const sortedAlerts = useMemo(() => {
    const data = rows;
    if (!sortKey || !sortOrder) return data;
    return [...data].sort((a, b) => {
      const A = getComparable(a, sortKey);
      const B = getComparable(b, sortKey);
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  // ⬇️ NEW: slice ตามหน้า
  const total = sortedAlerts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pagedAlerts = sortedAlerts.slice(start, end);

  if (!rows?.length) {
    return <div className="text-sm text-gray-500">No alerts to display.</div>;
  }

  return (
    <>
      <div className="col-span-full w-full">
        <Table className="table-auto w-full">
          <TableHeader>
            <TableRow className="border-b border-[var(--color-primary)]">
              {[
                { key: "severity", label: "Severity" },
                { key: "id", label: "Alert ID" },
                { key: "timestamp", label: "Timestamp" },
                { key: "camera", label: "Camera" },
                { key: "event", label: "Event Type" },
                { key: "location", label: "Location" },
                { key: "status", label: "Status" },
              ].map(({ key, label }) => (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key as SortKey)}
                  className="cursor-pointer select-none text-[var(--color-primary)]"
                >
                  <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                    <span>{label}</span>
                    {renderSortIcon(key as SortKey)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagedAlerts.map((alr) => {
              const EventIcon = iconFromName(alr.event?.icon);
              const alrCode = `ALR${String(alr.id).padStart(3, "0")}`;
              return (
                <TableRow key={alr.id}>
                  <TableCell><SeverityBadge value={alr.severity} /></TableCell>
                  <TableCell>{alrCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icons.Clock3 className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{alr.create_date} {alr.create_time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icons.Camera className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{alr.camera.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EventIcon className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{alr.event.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{alr.camera.location.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge value={alr.status} /></TableCell>

                  <TableCell className="whitespace-nowrap">
                    <ActionBar
                      status={alr.status}
                      onView={() => viewAlert(alr.id)}
                      onResolve={() => resolveAlert(alr.id)}
                      onDismiss={() => dismissAlert(alr.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination bar */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing <span className="font-medium">{start + 1}</span>–
            <span className="font-medium">{end}</span> of{" "}
            <span className="font-medium">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-1 rounded-md border text-sm ${page <= 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Previous
            </button>
            <div className="text-sm tabular-nums">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded-md border text-sm ${page >= totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Modal: ใส่ reason + แสดง Meta (ไม่มีปุ่ม X) */}
        <AlertDialog open={openModal} onOpenChange={setOpenModal}>
          <AlertDialogContent className="sm:max-w-lg [&>button:last-child]:hidden">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--color-primary)]">
                {pending?.status === "resolved" ? "Resolve Alert" : "Dismiss Alert"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Review alert details and provide a reason before continuing.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Meta block (minimal แบบการ์ด) */}
            {pendingAlert && (
              <div className="rounded-lg border border-[var(--color-primary-bg)] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  {/* Event Icon + Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => {
                      const EventIcon = iconFromName(pendingAlert.event?.icon);
                      return (
                        <EventIcon className="h-5 w-5 text-[var(--color-primary)] shrink-0" />
                      );
                    })()}
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--color-primary)] truncate">
                        {pendingAlert.event?.name ?? "-"}
                      </div>
                      <div className="text-xs text-gray-500">Event</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-white border border-gray-200 text-gray-700">
                      ALR{String(pendingAlert.id).padStart(3, "0")}
                    </span>
                    <SeverityBadge value={pendingAlert.severity} />
                    <StatusBadge value={pendingAlert.status} />
                  </div>
                </div>

                {/* กล้อง / เวลา / Location */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Icons.Clock3 className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>{pendingAlert.create_date} {pendingAlert.create_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Camera className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="truncate">{pendingAlert.camera?.name ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="truncate">{pendingAlert.camera?.location?.name ?? "-"}</span>
                  </div>
                </div>

                {/* Description (labeled) */}
                {(() => {
                  const desc = pendingAlert?.alert_description ?? (pendingAlert as any)?.description ?? "";
                  return (
                    <div className="mt-3 border-t pt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Icons.FileText className="w-4 h-4 text-[var(--color-primary)]" />
                        <span className="uppercase tracking-wide">Description</span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {desc?.trim() ? desc : <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* Reason field */}
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setReasonError(null);
                }}
                rows={4}
                placeholder="Enter reason…"
                className={`w-full rounded-md border p-2 text-sm outline-none focus:ring-2 ${reasonError
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-gray-300 focus:ring-[var(--color-primary)]"
                  }`}
              />
              {reasonError && (
                <p className="text-xs text-rose-600">{reasonError}</p>
              )}
            </div>

            {/* Footer */}
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
                Cancel
              </AlertDialogCancel>

              {/* ใช้ Button ปกติแทน AlertDialogAction */}
              <button
                type="button"
                onClick={submitStatus}
                disabled={!reason.trim()} // กันพลาด UX ดีขึ้น
                className={`px-5 h-10 rounded-md text-white disabled:opacity-50 ${pending?.status === "dismissed"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-[var(--color-info,#0ea5e9)] hover:bg-sky-600"
                  }`}
              >
                {pending?.status === "dismissed" ? "Dismiss" : "Resolve"}
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}