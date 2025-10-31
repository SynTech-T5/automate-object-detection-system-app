// app/components/Cameras/CameraTable.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown, Trash2, Pencil, CircleAlert,
} from "lucide-react";
import * as Icons from "lucide-react";
import EditCameraModal from "../Forms/EditCameraForm";
import { DeleteConfirmModal } from "@/app/components/Utilities/AlertsPopup";
import { Camera } from "@/app/models/cameras.model";
import { MaintenanceTypeBadge } from "../Badges/BadgeMaintenanceType";
import BadgeCameraType from "../Badges/BadgeCameraType";
import { useMe } from "@/hooks/useMe";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SortKey = "id" | "name" | "status" | "location" | "type" | "maintenance";
type SortOrder = "asc" | "desc" | null;

type ActionActive = "view" | "edit" | "details" | "delete";
type Props = {
  cameras: Camera[];
  active?: ActionActive;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDetails?: (camera: Camera) => void;
  onDelete?: (id: number, user_id?: number) => void | Promise<void>;
};

/* ------------------------ Ghost → Full Icon Button ------------------------ */
function IconAction({
  label,
  children,
  variant = "primary", // primary | danger
  onClick,
  disabled,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  variant?: "primary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
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
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
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

/* -------------------------------- Utilities ------------------------------- */
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
  const statusParam = searchParams.get("status");

  const { me, loading: loadingMe, error: meError } = useMe();

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name?: string } | null>(null);

  function openDelete(cam: Camera) {
    setDeleteTarget({ id: cam.camera_id!, name: cam.camera_name });
    setDeleteOpen(true);
  }

  async function onConfirmDelete(_: { input?: string; note?: string }) {
    if (!deleteTarget) return;

    const user_id = Number((me as any)?.usr_id);
    if (!Number.isFinite(user_id) || user_id <= 0) {
      alert(meError || "Cannot resolve user_id from current user.");
      return;
    }

    try {
      setBusyId(deleteTarget.id);

      if (onDelete) {
        await Promise.resolve(onDelete(deleteTarget.id, user_id));
      } else {
        const res = await fetch(`/api/cameras/${deleteTarget.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({ user_id }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Delete failed");
      }

      setDeleteOpen(false);
      setDeleteTarget(null);
      setTimeout(() => window.location.reload(), 0);
    } catch (e) {
      alert((e as Error).message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  const goEdit = () => {
    if (onEdit) onEdit(getVal(cameras[0], "id") as number);
    setOpen(true);
  };

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

  const filtered = useMemo(() => {
    const want = parseStatusParam(statusParam);
    if (want === null) return cameras;
    return cameras.filter((cam) => !!cam.camera_status === want);
  }, [cameras, statusParam]);

  const getVal = (cam: Camera, key: SortKey) => {
    switch (key) {
      case "id": return cam.camera_id ?? 0;
      case "name": return cam.camera_name ?? "";
      case "status": return cam.camera_status ? 1 : 0;
      case "location": return cam.location_name ?? "";
      case "type": return cam.camera_type ?? "";
      case "maintenance":
        return cam.date_last_maintenance
          ? new Date(cam.date_last_maintenance).getTime()
          : 0;
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

  // --- เพิ่ม state + ค่าคงที่ด้านบนของ component ---
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  // รีเซ็ตหน้าเมื่อ filter/sort เปลี่ยน
  useEffect(() => {
    setPage(1);
  }, [statusParam, sortKey, sortOrder]);

  // คำนวณ pagination จาก "sorted"
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageItems = sorted.slice(start, end);

  // กันค่าหน้าเกินช่วง เมื่อ filtered/sorted เปลี่ยน
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  if (!filtered.length) {
    return (
      <div className="text-sm text-gray-500">
        {cameras?.length ? "No cameras match this status filter." : "No cameras to display."}
      </div>
    );
  }

  return (
    <div className="col-span-full w-full">
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

            <TableHead
              onClick={() => handleSort("type")}
              className="cursor-pointer select-none text-[var(--color-primary)]"
            >
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Type</span>
                {renderSortIcon("type")}
              </div>
            </TableHead>

            <TableHead onClick={() => handleSort("status")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Status</span>
                {renderSortIcon("status")}
              </div>
            </TableHead>

            <TableHead onClick={() => handleSort("maintenance")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Last Maintenance</span>
                {renderSortIcon("maintenance")}
              </div>
            </TableHead>

            <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <EditCameraModal camId={getVal(cameras[0], "id") as number} open={open} setOpen={setOpen} />

        <TableBody>
          {pageItems.map((cam) => {
            const camCode = `CAM${String(cam.camera_id).padStart(3, "0")}`;
            const statusLabel = cam.camera_status ? "Active" : "Inactive";

            return (
              <TableRow key={cam.camera_id} className="border-b last:border-b-0">
                <TableCell>{camCode}</TableCell>

                <TableCell className="font-medium truncate max-w-[320px]">
                  <div className="flex items-center gap-2">
                    <Icons.Camera className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                    <span>{cam.camera_name}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                    <span className="truncate max-w-[260px]">{cam.location_name ?? "-"}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <BadgeCameraType type={cam.camera_type} />
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cam.camera_status ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                  >
                    {cam.camera_status ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {statusLabel}
                  </span>
                </TableCell>

                <TableCell>
                  <MaintenanceTypeBadge name={cam.maintenance_type} date={cam.date_last_maintenance} />
                </TableCell>

                <TableCell className="min-w-[220px]">
                  <div className="flex flex-wrap gap-2">
                    {/* View */}
                    <IconAction
                      label="View"
                      variant="primary"
                      onClick={() =>
                        onView ? onView(cam.camera_id) : router.push(`/cameras/${cam.camera_id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </IconAction>

                    {/* Setting (เปิด modal เดิม) */}
                    <IconAction label="Settings" variant="primary" onClick={goEdit}>
                      <Pencil className="h-4 w-4" />
                    </IconAction>

                    {/* Details */}
                    <IconAction
                      label="Details"
                      variant="primary"
                      onClick={() =>
                        onDetails ? onDetails(cam) : router.push(`/cameras/${cam.camera_id}/details`)
                      }
                    >
                      <CircleAlert className="h-4 w-4" />
                    </IconAction>

                    {/* Delete */}
                    <IconAction
                      label="Delete"
                      variant="danger"
                      disabled={busyId === cam.camera_id}
                      onClick={() => openDelete(cam)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconAction>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>

        <DeleteConfirmModal
          open={deleteOpen}
          onOpenChange={(v) => {
            if (!v) setDeleteTarget(null);
            setDeleteOpen(v);
          }}
          title="Delete Camera?"
          description={`This will remove ${deleteTarget?.name ?? "this camera"} (ID: ${deleteTarget?.id ?? "—"}) and related data. This action cannot be undone.`}
          confirmWord={deleteTarget?.name || undefined}
          confirmText="Delete"
          onConfirm={onConfirmDelete}
        />
      </Table>

      {/* Pagination bar (สไตล์เดียวกับหน้า timeline/past) */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Showing <span className="font-medium">{total ? start + 1 : 0}</span>–
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
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
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
    </div>
  );
}