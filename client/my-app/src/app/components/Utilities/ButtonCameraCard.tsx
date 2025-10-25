"use client";
import { useRouter } from "next/navigation";
import { Eye, Settings, Info, Trash2 } from "lucide-react";
import "@/styles/camera-card.css";
import EditCameraModal from "../Forms/EditCameraForm";
import { useState } from "react";
import { DeleteConfirmModal } from "@/app/components/Utilities/AlertsPopup";
import { useMe } from "@/hooks/useMe";

type Props = {
  camId: number;
  camName: string;
  className?: string;
  active?: "view" | "settings" | "details" | "delete";
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDetails?: (id: number) => void;
  onDelete?: (id: number, user_id?: number) => void | Promise<void>;
};

export default function BottomCameraCard({
  camId,
  camName,
  className = "",
  active,
  onView,
  onEdit,
  onDetails,
  onDelete,
}: Props) {
  const router = useRouter();
  const { me, error: meError } = useMe();

  const [open, setOpen] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  const goView = () => (onView ? onView(camId) : router.push(`/cameras/${camId}`));
  const goEdit = () => {
    if (onEdit) onEdit(camId);
    setOpen(true);
  };
  const goDetails = () =>
    onDetails ? onDetails(camId) : router.push(`/cameras/${camId}/details`);

  async function confirmDelete() {
    const user_id = Number((me as any)?.usr_id);
    if (!Number.isFinite(user_id) || user_id <= 0) {
      alert(meError || "Cannot resolve user_id from current user.");
      return;
    }

    try {
      setBusyDelete(true);
      if (onDelete) {
        await Promise.resolve(onDelete(camId, user_id));
      } else {
        const res = await fetch(`/api/cameras/${camId}`, {
          method: "PATCH", // เปลี่ยนเป็น DELETE ได้ถ้าหลังบ้านรองรับ
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
      setTimeout(() => window.location.reload(), 0);
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusyDelete(false);
    }
  }

  const wrap =
    "flex w-full overflow-hidden rounded-xl border border-[var(--color-hardGray)] " +
    "bg-[var(--color-white)] shadow-sm divide-x divide-[var(--color-hardGray)] " +
    className;

  const btnBase =
    "group relative flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 " +
    "text-sm text-[var(--color-black)] transition-colors focus:outline-none " +
    "rounded-none first:rounded-l-xl last:rounded-r-xl";

  const btnTrash =
    "group relative flex-1 inline-flex items-center justify-center gap-2 px-1 py-2 " +
    "text-sm text-[var(--color-black)] transition-colors focus:outline-none " +
    "rounded-none first:rounded-l-xl last:rounded-r-xl";

  const hoverBlue =
    "hover:text-[var(--color-primary)] hover:shadow-[inset_0_0_0_2px_var(--color-primary)]";
  const activeBlue =
    "text-[var(--color-primary)] shadow-[inset_0_0_0_2px_var(--color-primary)]";

  const hoverRed =
    "hover:text-[var(--color-danger)] hover:shadow-[inset_0_0_0_2px_var(--color-danger)]";
  const activeRed =
    "text-[var(--color-danger)] shadow-[inset_0_0_0_2px_var(--color-danger)]";

  return (
    <div className={wrap} role="group" aria-label="Camera actions">
      {/* View */}
      <button
        onClick={goView}
        type="button"
        className={`${btnBase} ${hoverBlue} ${active === "view" ? activeBlue : ""}`}
        title="View"
        aria-label="View"
      >
        <Eye className="h-4 w-4" />
        <span className={active === "view" ? "text-[var(--color-primary)]" : ""}>View</span>
      </button>

      {/* Edit */}
      <button
        onClick={goEdit}
        type="button"
        className={`${btnBase} ${hoverBlue} ${active === "settings" ? activeBlue : ""}`}
        title="Edit"
        aria-label="Edit"
      >
        <Settings className="h-4 w-4" />
        <span className={active === "settings" ? "text-[var(--color-primary)]" : ""}>
          Settings
        </span>
      </button>

      <EditCameraModal camId={camId} open={open} setOpen={setOpen} />

      {/* Details */}
      <button
        onClick={goDetails}
        type="button"
        className={`${btnBase} ${hoverBlue} ${active === "details" ? activeBlue : ""}`}
        title="Details"
        aria-label="Details"
      >
        <Info className="h-4 w-4" />
        <span className={active === "details" ? "text-[var(--color-primary)]" : ""}>
          Details
        </span>
      </button>

      {/* Delete */}
      <DeleteConfirmModal
        title="Delete Camera?"
        description={`This will remove ${camName || `camera ID: ${camId}`}. This action cannot be undone.`}
        confirmWord={camName || undefined}
        confirmText={busyDelete ? "Deleting..." : "Delete"}
        onConfirm={async () => {
          if (!busyDelete) await confirmDelete();
        }}
        trigger={
          <button
            type="button"
            disabled={busyDelete}
            className={`${btnTrash} ${hoverRed} ${active === "delete" ? activeRed : ""}`}
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}