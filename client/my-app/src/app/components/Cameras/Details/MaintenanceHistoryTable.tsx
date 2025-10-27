"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowDown, ArrowUp, ArrowUpDown, ClipboardCheck, Hammer,
  RefreshCw, Search, Settings, Wrench, ArrowUpCircle, User, Pencil, Trash2, Plus
} from "lucide-react";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/models/cameras.model";
import { DeleteConfirmModal } from "@/app/components/Utilities/AlertsPopup";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

/* =========================================================
   Types
========================================================= */
type ApiMaintenance = {
  maintenance_id: number;
  camera_id: number;
  maintenance_date: string;
  maintenance_type: string;
  maintenance_technician: string;
  maintenance_note: string;
  maintenance_created_date?: string;
  maintenance_created_time?: string;
};

type Row = {
  id: number;
  cameraId: number;
  date: string;
  type: string;     // UI Title Case
  typeRaw: string;  // api lowercase
  technician: string;
  notes: string;
};

type SortKey = "id" | "date" | "type" | "technician";
type SortOrder = "asc" | "desc" | null;

/* =========================================================
   Helpers
========================================================= */
function toTitleCase(s: string) {
  return s.trim().split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}
function toApiType(s: string) {
  return s.trim().toLowerCase();
}

/* =========================================================
   Badge
========================================================= */
const TYPE_META: Record<string, { icon: React.ReactNode; classes: string }> = {
  "Routine Check": { icon: <ClipboardCheck className="w-3 h-3 mr-1" />, classes: "border border-blue-300 text-blue-700 bg-blue-50" },
  Repair: { icon: <Wrench className="w-3 h-3 mr-1" />, classes: "border border-red-300 text-red-700 bg-red-50" },
  Installation: { icon: <Hammer className="w-3 h-3 mr-1" />, classes: "border border-emerald-300 text-emerald-700 bg-emerald-50" },
  Upgrade: { icon: <ArrowUpCircle className="w-3 h-3 mr-1" />, classes: "border border-purple-300 text-purple-700 bg-purple-50" },
  Replacement: { icon: <RefreshCw className="w-3 h-3 mr-1" />, classes: "border border-orange-300 text-orange-700 bg-orange-50" },
  Inspection: { icon: <Search className="w-3 h-3 mr-1" />, classes: "border border-amber-300 text-amber-700 bg-amber-50" },
  Configuration: { icon: <Settings className="w-3 h-3 mr-1" />, classes: "border border-teal-300 text-teal-700 bg-teal-50" },
};

function MaintenanceTypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] ?? { icon: <ClipboardCheck className="w-3 h-3 mr-1" />, classes: "border border-gray-300 text-gray-700 bg-gray-50" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.classes}`}>
      {meta.icon}
      {type}
    </span>
  );
}

/* =========================================================
   Minimal Icon Button (Ghost → Full)
========================================================= */
function IconGhostFullBtn({
  label,
  variant = "primary", // primary | danger
  disabled,
  onClick,
  className = "",
  children,
}: {
  label: string;
  variant?: "primary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const palette =
    variant === "danger"
      ? {
        border: "border-[var(--color-danger)]",
        text: "text-[var(--color-danger)]",
        hoverBg: "hover:bg-[var(--color-danger)]",
        focusRing: "focus:ring-[var(--color-danger)]",
      }
      : {
        border: "border-[var(--color-primary)]",
        text: "text-[var(--color-primary)]",
        hoverBg: "hover:bg-[var(--color-primary)]",
        focusRing: "focus:ring-[var(--color-primary)]",
      };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={[
              "inline-flex items-center justify-center h-8 w-8 rounded-full",
              "bg-transparent border", palette.border, palette.text,
              "hover:text-white", palette.hoverBg, "hover:border-transparent",
              "transition focus:outline-none focus:ring-2 focus:ring-offset-2", palette.focusRing,
              "disabled:opacity-50 disabled:cursor-not-allowed",
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

/* =========================================================
   Add Modal
========================================================= */
function AddMaintenanceModal({
  camId,
  onAdded,
}: {
  camId: number;
  onAdded: (row: Row) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [date, setDate] = useState<string>("");
  const [type, setType] = useState<string>("Routine Check");
  const [technician, setTechnician] = useState<string>("");
  const [note, setNote] = useState<string>("");

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setErr("");
      if (!camId || !date || !type || !technician) throw new Error("Please fill date, type, and technician.");

      const body = { technician, type: toApiType(type), date, note };
      const res = await fetch(`/api/cameras/${camId}/maintenance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

      const created: ApiMaintenance = json?.data?.[0] || {
        maintenance_id: json?.data?.maintenance_id ?? Math.floor(Math.random() * 1e9),
        camera_id: camId,
        maintenance_date: date,
        maintenance_type: body.type,
        maintenance_technician: technician,
        maintenance_note: note,
      };

      const row: Row = {
        id: created.maintenance_id,
        cameraId: created.camera_id,
        date: created.maintenance_date,
        type: toTitleCase(created.maintenance_type),
        typeRaw: created.maintenance_type,
        technician: created.maintenance_technician,
        notes: created.maintenance_note,
      };

      onAdded(row);
      setOpen(false);
      setDate("");
      setType("Routine Check");
      setTechnician("");
      setNote("");
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-3 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Maintenance
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--color-primary)]">Add Maintenance</AlertDialogTitle>
          <AlertDialogDescription>Fill in the maintenance details and click Save.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="mnt_date">Date</label>
            <input
              id="mnt_date" type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="mnt_type">Type</label>
            <select
              id="mnt_type" value={type} onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
            >
              {[
                "Routine Check",
                "Repair",
                "Installation",
                "Upgrade",
                "Replacement",
                "Inspection",
                "Configuration",
              ].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="mnt_technician">Technician</label>
            <input
              id="mnt_technician" value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
              placeholder="Technician name"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="mnt_note">Note</label>
            <textarea
              id="mnt_note" value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
              placeholder="Note"
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* =========================================================
   Edit Modal (Trigger = Ghost→Full icon)
========================================================= */
function EditMaintenanceModal({
  row,
  onUpdated,
}: {
  row: Row;
  onUpdated: (row: Row) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const [date, setDate] = useState<string>(row.date);
  const [type, setType] = useState<string>(row.type);
  const [technician, setTechnician] = useState<string>(row.technician);
  const [note, setNote] = useState<string>(row.notes);

  async function handleSubmit() {
    try {
      setSubmitting(true);
      setErr("");

      const body = { technician, type: toApiType(type), date, note };
      const res = await fetch(`/api/cameras/maintenance/${row.id}`, {
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

      const updated: Row = { ...row, date, type, typeRaw: body.type, technician, notes: note };
      onUpdated(updated);
      setOpen(false);
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Tooltip → Trigger → Button (ghost→full) */}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label="Edit"
                className={[
                  "inline-flex items-center justify-center h-8 w-8 rounded-full",
                  "bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)]",
                  "hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent",
                  "transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]",
                ].join(" ")}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--color-primary)]">Edit Maintenance #{row.id}</AlertDialogTitle>
          <AlertDialogDescription>Update the fields and click Save.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="em_date">Date</label>
            <input
              id="em_date" type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="em_type">Type</label>
            <select
              id="em_type" value={type} onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
            >
              {[
                "Routine Check", "Repair", "Installation", "Upgrade",
                "Replacement", "Inspection", "Configuration",
              ].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="em_technician">Technician</label>
            <input
              id="em_technician" value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="em_note">Note</label>
            <textarea
              id="em_note" value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* =========================================================
   Main: CameraMaintenance
========================================================= */
export default function CameraMaintenance({ camera }: { camera: Camera }) {
  const camId = Number(camera?.camera_id ?? 0);

  const [records, setRecords] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  useEffect(() => {
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

        const res = await fetch(`/api/cameras/${camId}/maintenance`, {
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

        const rows: ApiMaintenance[] = Array.isArray(json?.data) ? json.data : [];
        const mapped: Row[] = rows.map(r => ({
          id: r.maintenance_id,
          cameraId: r.camera_id,
          date: r.maintenance_date,
          type: toTitleCase(r.maintenance_type),
          typeRaw: r.maintenance_type,
          technician: r.maintenance_technician,
          notes: r.maintenance_note,
        }));

        if (mounted) setRecords(mapped);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load maintenance");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [camId]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  const sortedRecords = useMemo(() => {
    if (!sortOrder) return records;
    const arr = [...records];
    return arr.sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];

      if (sortKey === "date") {
        const aTime = new Date(String(aVal)).getTime();
        const bTime = new Date(String(bVal)).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [records, sortKey, sortOrder]);

  function onAdded(row: Row) {
    setRecords(prev => [row, ...prev]);
  }
  function onUpdated(row: Row) {
    setRecords(prev => prev.map(r => (r.id === row.id ? row : r)));
  }

  function askDelete(row: Row) {
    setDeleteTarget(row);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setBusyDelete(true);
      const res = await fetch(`/api/cameras/maintenance/${deleteTarget.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

      setRecords(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <div className="w-full">
      {/* Header + Add button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[var(--color-primary)]">Maintenance</h3>
        <AddMaintenanceModal camId={camId} onAdded={onAdded} />
      </div>

      {loading && <p className="text-sm text-slate-500 mb-2">Loading maintenance…</p>}
      {err && !loading && <p className="text-sm text-red-600 mb-2">{err}</p>}

      <div className="w-full max-h-[420px] overflow-y-auto">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("id")} className="cursor-pointer select-none text-[var(--color-primary)]">
                <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                  <span>ID</span>
                  {renderSortIcon("id")}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("date")} className="cursor-pointer select-none text-[var(--color-primary)]">
                <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                  <span>Date</span>
                  {renderSortIcon("date")}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("type")} className="cursor-pointer select-none text-[var(--color-primary)]">
                <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                  <span>Type</span>
                  {renderSortIcon("type")}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("technician")} className="cursor-pointer select-none text-[var(--color-primary)]">
                <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                  <span>Technician</span>
                  {renderSortIcon("technician")}
                </div>
              </TableHead>
              <TableHead className="text-[var(--color-primary)] text-[12px] text-left font-medium">
                Notes
              </TableHead>
              <TableHead className="w-[96px] text-[var(--color-primary)] text-left font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!loading && !err && sortedRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-[12px] text-gray-500 text-center">
                  No maintenance records.
                </TableCell>
              </TableRow>
            )}

            {sortedRecords.map((rec) => {
              const maintenanceCode = `MNT${String(rec.id).padStart(3, "0")}`;
              return (
                <TableRow key={rec.id} className="border-b border-gray-200 align-top text-[12px]">
                  <TableCell className="pl-0 py-3 align-top text-left font-medium">
                    {maintenanceCode}
                  </TableCell>

                  <TableCell className="px-2 py-3 align-top text-left font-medium">{rec.date}</TableCell>
                  <TableCell className="px-2 py-3 align-top text-left font-medium">
                    <MaintenanceTypeBadge type={rec.type} />
                  </TableCell>
                  <TableCell className="px-2 py-3 align-top font-medium text-left">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>{rec.technician}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-3 whitespace-pre-wrap break-words align-top text-left">
                    {rec.notes}
                  </TableCell>

                  <TableCell className="px-2 py-3 align-top text-left">
                    <div className="flex items-center gap-2">
                      {/* Edit (ghost→full primary) */}
                      <EditMaintenanceModal row={rec} onUpdated={onUpdated} />

                      {/* Delete (ghost→full danger) */}
                      <IconGhostFullBtn
                        label="Delete"
                        variant="danger"
                        disabled={busyDelete}
                        onClick={() => {
                          if (busyDelete) return;
                          setDeleteTarget(rec);   // ต้องตั้ง target ก่อน
                          setDeleteOpen(true);    // แล้วค่อยเปิด modal
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconGhostFullBtn>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal ลบ */}
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={(v) => {
          if (busyDelete) return;
          setDeleteOpen(v);
          if (!v) setDeleteTarget(null);
        }}
        title="Delete Maintenance?"
        description="This action cannot be undone."
        confirmText={busyDelete ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={() => !busyDelete && confirmDelete()}
      />
    </div>
  );
}