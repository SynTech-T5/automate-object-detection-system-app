"use client";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Info, Trash2 } from "lucide-react"; // ใช้เมื่อ iconSet="lucide"
import "@/styles/camera-card.css";

type IconSet = "fi" | "lucide";

type Props = {
  camId: number;
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
  const goEdit = () => (onEdit ? onEdit(camId) : router.push(`/cameras/${camId}/edit`));
  const goDetails = () =>
    onDetails ? onDetails(camId) : router.push(`/cameras/${camId}?tab=details`);
  const doDelete = async () => {
    if (onDelete) return onDelete(camId);
    if (!confirm("ลบกล้องนี้?")) return;
    await fetch(`/api/cameras/${camId}`, { method: "DELETE" });
    router.refresh();
  };

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

      {/* Delete */}
      <button
        onClick={doDelete}
        type="button"
        className={`${btnTrash} ${hoverRed} ${active === "delete" ? activeRed : ""}`}
        title="Delete"
        aria-label="Delete"
      >
        {icon.delete}
        <span className={`${active === "delete" ? "text-[var(--color-danger)]" : ""}`}>
          
        </span>
      </button>
    </div>
  );
}