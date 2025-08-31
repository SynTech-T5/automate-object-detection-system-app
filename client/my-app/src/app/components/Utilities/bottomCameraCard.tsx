"use client";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Info, Trash2 } from "lucide-react"; // ใช้เมื่อ iconSet="lucide"
import "@/styles/camera-card.css";
import EditCameraModal from "../Cameras/EditCameraModal";
import { useState } from "react";
import { DeleteConfirmModal } from "@/app/components/Alertspopup";

type IconSet = "fi" | "lucide";

type Props = {
  camId: number;
  camName: string;
  className?: string;
  iconSet?: IconSet; // "fi" (flaticon) | "lucide"
  active?: "view" | "edit" | "details" | "delete";
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDetails?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function BottomCameraCard({
  camId,
  camName,
  className = "",
  iconSet = "fi",
  active,
  onView,
  onEdit,
  onDetails,
  onDelete,
}: Props) {
  const router = useRouter();

  // default handlers
  const goView = () => (onView ? onView(camId) : router.push(`/cameras/${camId}`));
  const [open, setOpen] = useState(false);

  // const goEdit = () => (onEdit ? onEdit(camId) : router.push(`/cameras/${camId}/edit`));
  const goEdit = () => {
    if (onEdit) {
      onEdit(camId); // ส่งค่า camId กลับไปให้ parent
    }
    setOpen(true);
  };

  const goDetails = () =>
    onDetails ? onDetails(camId) : router.push(`/cameras/${camId}/details`);

  // ลบ + reload หน้า
  const [busyDelete, setBusyDelete] = useState(false);
  async function confirmDelete() {
    try {
      setBusyDelete(true);
      if (onDelete) {
        await Promise.resolve(onDelete(camId));
      } else {
        const res = await fetch(`/api/cameras/${camId}/soft-delete`, { method: "PATCH" });
        if (!res.ok) throw new Error("Delete failed");
      }
      // ✅ reload ทั้งหน้าให้เห็นผลทันที
      setTimeout(() => window.location.reload(), 0);
    } catch (e) {
      alert((e as Error).message || "Delete failed");
    } finally {
      setBusyDelete(false);
    }
  }

  // กล่องรวมปุ่ม: ใช้ border ที่ container + divide-x เพื่อไม่ให้ขอบทับกัน
  const wrap =
    "flex w-full overflow-hidden rounded-xl border border-[var(--color-hardGray)] " +
    "bg-[var(--color-white)] shadow-sm divide-x divide-[var(--color-hardGray)] " +
    className;

  // ปุ่ม: ไม่ใส่ border เอง ปล่อยให้เส้นแบ่งมาจาก parent
  // ใช้ inset box-shadow เป็น 'border สี' ตอน hover/active
  const btnBase =
    "group relative flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 " +
    "text-sm text-[var(--color-black)] transition-colors focus:outline-none " +
    "rounded-none first:rounded-l-xl last:rounded-r-xl";

  const btnTrash =
    "group relative flex-1 inline-flex items-center justify-center gap-2 px-1 py-2 " +
    "text-sm text-[var(--color-black)] transition-colors focus:outline-none " +
    "rounded-none first:rounded-l-xl last:rounded-r-xl";

  // ไฮไลต์สีน้ำเงิน (hover/active)
  const hoverBlue =
    "hover:text-[var(--color-primary)] " +
    "hover:shadow-[inset_0_0_0_2px_var(--color-primary)]";
  const activeBlue =
    "text-[var(--color-primary)] shadow-[inset_0_0_0_2px_var(--color-primary)]";

  // ไฮไลต์แดง (ปุ่มลบ)
  const hoverRed =
    "hover:text-[var(--color-danger)] " +
    "hover:shadow-[inset_0_0_0_2px_var(--color-danger)]";
  const activeRed =
    "text-[var(--color-danger)] shadow-[inset_0_0_0_2px_var(--color-danger)]";

  // ไอคอน: เลือก flaticon หรือ lucide
  const icon = {
    view:
      iconSet === "fi" ? (
        <i className="fi fi-tr-eye-lashes text-[16px] leading-none group-hover:text-[var(--color-primary)]" />
      ) : (
        <Eye className="h-4 w-4 group-hover:text-[var(--color-primary)]" />
      ),
    edit:
      iconSet === "fi" ? (
        <i className="fi fi-tr-pen-field text-[16px] leading-none group-hover:text-[var(--color-primary)]" />
      ) : (
        <Pencil className="h-4 w-4 group-hover:text-[var(--color-primary)]" />
      ),
    details:
      iconSet === "fi" ? (
        <i className="fi fi-tr-info text-[16px] leading-none group-hover:text-[var(--color-primary)]" />
      ) : (
        <Info className="h-4 w-4 group-hover:text-[var(--color-primary)]" />
      ),
    delete:
      iconSet === "fi" ? (
        <i className="fi fi-rr-trash text-[18px] leading-none group-hover:text-[var(--color-danger)]" />
      ) : (
        <Trash2 className="h-4 w-4 group-hover:text-[var(--color-danger)]" />
      ),
  };

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
        {icon.view}
        <span className={`${active === "view" ? "text-[var(--color-primary)]" : ""}`}>
          View
        </span>
      </button>

      {/* Edit */}
      <button
        onClick={goEdit}
        type="button"
        className={`${btnBase} ${hoverBlue} ${active === "edit" ? activeBlue : ""}`}
        title="Edit"
        aria-label="Edit"
      >
        {icon.edit}
        <span className={`${active === "edit" ? "text-[var(--color-primary)]" : ""}`}>
          Edit
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
        {icon.details}
        <span
          className={`${active === "details" ? "text-[var(--color-primary)]" : ""}`}
        >
          Details
        </span>
      </button>

      {/* Delete (ใช้ shadcn modal เป็น trigger รอบปุ่ม) */}
      <DeleteConfirmModal
        title="Delete Camera?"
        description={`This will remove camera ID: ${camId}. This action cannot be undone.`}
        confirmWord={camName || undefined} 
        confirmText="Delete"
        onConfirm={async () => {
          await confirmDelete();
        }}
        trigger={
          <button
            type="button"
            disabled={busyDelete}
            className={`${btnTrash} ${hoverRed} ${active === "delete" ? activeRed : ""}`}
            title="Delete"
            aria-label="Delete"
          >
            {icon.delete}
            {/* เว้น label ว่างไว้ตามดีไซน์เดิม */}
            <span className={`${active === "delete" ? "text-[var(--color-danger)]" : ""}`} />
          </button>
        }
      />
    </div>
  );
}