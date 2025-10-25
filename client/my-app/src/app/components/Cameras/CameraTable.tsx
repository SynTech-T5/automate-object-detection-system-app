"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar, Trash2, Pencil, CircleAlert,
  Camera as CameraIcon, Move, Scan, Thermometer, Activity,
} from "lucide-react";
import * as Icons from "lucide-react";
import EditCameraModal from "../Forms/EditCameraForm";
import { DeleteConfirmModal } from "@/app/components/Utilities/AlertsPopup";
import { Camera } from "@/app/models/cameras.model";
import { MaintenanceTypeBadge } from "../Badges/BadgeMaintenanceType";
import BadgeCameraType from "../Badges/BadgeCameraType";
import { useMe } from "@/hooks/useMe"; // ✅ เพิ่ม

type SortKey = "id" | "name" | "status" | "location" | "maintenance";
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

// ------------------------------------------

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

  const { me, loading: loadingMe, error: meError } = useMe(); // ✅ ดึง me

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

    // ✅ สร้าง user_id จาก me
    const user_id = Number((me as any)?.usr_id);
    if (!Number.isFinite(user_id) || user_id <= 0) {
      alert(meError || "Cannot resolve user_id from current user.");
      return;
    }

    try {
      setBusyId(deleteTarget.id);

      if (onDelete) {
        // ✅ ส่ง user_id ให้ callback ภายนอกด้วย
        await Promise.resolve(onDelete(deleteTarget.id, user_id));
      } else {
        // ✅ ส่ง usr_id ไปกับ API ตามที่ร้องขอ
        const res = await fetch(`/api/cameras/${deleteTarget.id}`, {
          method: "PATCH", // ใช้เมธอดเดิมของคุณ
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

      // ปิด modal แล้ว reload หน้า
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
    if (onEdit) {
      onEdit(getVal(cameras[0], "id") as number);
    }
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
      case "id":
        return cam.camera_id ?? 0;
      case "name":
        return cam.camera_name ?? "";
      case "status":
        return cam.camera_status ? 1 : 0;
      case "location":
        return cam.location_name ?? "";
      case "maintenance":
        return cam.maintenance_type ?? "";
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
        {sorted.map((cam) => {
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
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    cam.camera_status ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
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
                  <button
                    type="button"
                    onClick={() => (onView ? onView(cam.camera_id) : router.push(`/cameras/${cam.camera_id}`))}
                    title="View"
                    aria-label="View"
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={goEdit}
                    title="Edit"
                    aria-label="Edit"
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => (onDetails ? onDetails(cam) : router.push(`/cameras/${cam.camera_id}/details`))}
                    title="Details"
                    aria-label="Details"
                    className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <CircleAlert className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openDelete(cam)}
                    title="Delete"
                    aria-label="Delete"
                    disabled={busyId === cam.camera_id}
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
  );
}