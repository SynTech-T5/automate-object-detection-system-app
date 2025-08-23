"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown, Calendar, Trash2, Pencil, CircleAlert
} from "lucide-react";
import type { Camera } from "./CameraCard";

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

export default function CameraTable({
  cameras,
  active,
  onView,
  onEdit,
  onDetails,
  onDelete,
}: Props) {
  const router = useRouter();

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [busyId, setBusyId] = useState<number | null>(null); // กันคลิกซ้ำตอนลบ

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

  const getVal = (c: Camera, key: SortKey) => {
    switch (key) {
      case "id":
        return (c as any).id ?? (c as any).cam_id ?? 0;
      case "name":
        return (c as any).name ?? (c as any).cam_name ?? "";
      case "status":
        return (c as any).status ?? (c as any).cam_status ?? false;
      case "location":
        return (
          (c as any).location?.name ??
          (c as any).cam_location ??
          (c as any).location ??
          ""
        );
      case "health":
        return (c as any).health ?? (c as any).cam_health ?? 0;
      default:
        return "";
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !sortOrder) return cameras;
    const arr = [...cameras];
    arr.sort((a, b) => {
      const A = getVal(a, sortKey);
      const B = getVal(b, sortKey);
      const aVal = typeof A === "boolean" ? (A ? 1 : 0) : A;
      const bVal = typeof B === "boolean" ? (B ? 1 : 0) : B;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [cameras, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  if (!cameras?.length) {
    return <div className="text-sm text-gray-500">No cameras to display.</div>;
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
          const id = (c as any).id ?? (c as any).cam_id;
          const name = (c as any).name ?? (c as any).cam_name ?? "-";
          const statusVal = (c as any).status ?? (c as any).cam_status ?? false;
          const statusLabel = statusVal ? "Active" : "Inactive";
          const location =
            (c as any).location?.name ??
            (c as any).cam_location ??
            (c as any).location ??
            "-";
          const health = (c as any).health ?? (c as any).cam_health ?? null;
          const type = (c as any).type ?? (c as any).cam_type ?? "Fixed";
          const maintenance =
            (c as any).maintenance ??
            (c as any).cam_maintenance ??
            (c as any).last_maintenance ??
            "-";
          const camCode = `CAM${String(id).padStart(3, "0")}`;

          // --- action handlers (ต่อกล้องแต่ละตัว) ---
          const handleView = () =>
            onView ? onView(id) : router.push(`/cameras/${id}`);

          const handleEdit = () =>
            onEdit ? onEdit(id) : router.push(`/cameras/${id}/edit`);

          const handleDetails = () =>
            onDetails ? onDetails(id) : router.push(`/cameras/${id}?tab=details`);

          const handleDelete = async () => {
            if (onDelete) return onDelete(id);
            if (!confirm("ลบกล้องนี้?")) return;
            try {
              setBusyId(id);
              const res = await fetch(`/api/cameras/${id}`, { method: "DELETE" });
              if (!res.ok) throw new Error("Delete failed");
              router.refresh();
            } catch (e) {
              alert((e as Error).message || "Delete failed");
            } finally {
              setBusyId(null);
            }
          };

          const btnBase =
            "inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2";
          const primary = "bg-[var(--color-primary)] text-white focus:ring-[var(--color-primary)]";
          const hoverPrimary = "hover:bg-[var(--color-primary)] border hover:border-[var(--color-primary)] hover:text-white";
          const danger = "bg-white border border-[var(--color-danger)] text-[var(--color-danger)]";
          const hoverDanger = "hover:bg-[var(--color-danger)] border hover:border-[var(--color-danger)] hover:text-white";
          const ghost  = "bg-white border border-[var(--color-primary)] text-[var(--color-primary)]";
          const hoverGhost  = "hover:bg-white border hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]";

          return (
            <TableRow key={id} className="border-b last:border-b-0">
              <TableCell>{camCode}</TableCell>
              <TableCell className="font-medium truncate max-w-[320px]">
                {name}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <span className="truncate max-w-[260px]">{location}</span>
                </div>
              </TableCell>

              <TableCell>
                <span className="truncate max-w-[260px]">{type}</span>
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusVal
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {statusVal ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {statusLabel}
                </span>
              </TableCell>

              <TableCell>
                {health === null ? "-" : (
                  <span className="tabular-nums">
                    {typeof health === "number" ? `${health}%` : String(health)}
                  </span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <span className="truncate max-w-[260px]">{maintenance}</span>
                </div>
              </TableCell>

              <TableCell className="min-w-[220px]">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleView}
                    title="View"
                    aria-label="View"
                    className={`${btnBase} ${ghost} ${hoverPrimary}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleEdit}
                    title="Edit"
                    aria-label="Edit"
                    className={`${btnBase} ${ghost} ${hoverPrimary}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDetails}
                    title="Details"
                    aria-label="Details"
                    className={`${btnBase} ${ghost} ${hoverPrimary}`}
                  >
                    <CircleAlert className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    title="Delete"
                    aria-label="Delete"
                    disabled={busyId === id}
                    className={`${btnBase} ${danger} ${hoverDanger}`}
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