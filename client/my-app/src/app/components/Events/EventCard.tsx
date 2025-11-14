"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Event } from "../../models/events.model";
import DynamicLucideIcon from "@/app/components/Utilities/DynamicLucide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditEventForm from "@/app/components/Forms/EditEventForm";
import { DeleteConfirmModal } from "@/app/components/Utilities/AlertsPopup";

export function EventCard({
  item,
  onToggle,
  onEdit,
  onDelete,
  className,
  disabled,
  endpoint = "/api/events",
  deleteBody = { status: false }, // ปรับให้ตรง backend ได้
}: {
  item: Event;
  onToggle?: (id: Event["event_id"], next: boolean) => void;
  onEdit?: (item: Event) => void;
  onDelete?: (item: Event) => void;
  className?: string;
  disabled?: boolean;
  endpoint?: string;
  deleteBody?: Record<string, any>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const switchId = `enable-${item.event_id}`;
  const sensitivityValue = (item.sensitivity || "medium").toLowerCase();
  const priorityValue = (item.priority || "medium").toLowerCase();

  function authHeaders(): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (process.env.NEXT_PUBLIC_TOKEN) {
      h.Authorization = `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`;
    }
    return h;
  }

  async function handleConfirmDelete() {
    try {
      setBusy(true);
      const res = await fetch(`${endpoint}/${item.event_id}`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(deleteBody),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Delete failed (HTTP ${res.status})`);
      }
      onDelete?.(item);
      setDeleteOpen(false);
      window.location.href = "/cameras";
    } catch (err) {
      console.error(err);
      setDeleteOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mt-10 group">
      {/* Top tab background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 h-16 rounded-2xl
                   bg-[#0B63FF]/10 shadow-sm z-0
                   transition-colors group-hover:bg-[#0B63FF]/20 group-hover:shadow-md border-2 border-[#0B63FF]/40"
      />
      {/* Floating icon */}
      <div className="absolute left-6 -top-6 z-20">
        <div className="grid place-items-center h-12 w-12 rounded-full bg-white ring-2 ring-[#0B63FF]/30 shadow">
          <div className="grid place-items-center h-10 w-10 rounded-full bg-[#0B63FF] text-white">
            <DynamicLucideIcon name={item.icon_name} className="h-5 w-5" />
          </div>
        </div>
      </div>

      <Card
        className={cn(
          "relative z-10 flex flex-col rounded-2xl border-2 border-[#0B63FF]/40 bg-white shadow-sm",
          "transition-colors hover:border-[#0B63FF] group-hover:border-[#0B63FF] p-6",
          className
        )}
      >
        <CardContent className="p-0 w-full">
          {/* Header + Actions */}
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-bold tracking-tight text-[#0B63FF] truncate">
                {item.event_name}
              </h3>
              {item.description && (
                <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0B63FF] transition hover:bg-[#0B63FF]/10 focus:outline-none disabled:opacity-50"
                  aria-label="Open menu"
                  disabled={disabled || busy}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {/* ใช้ onSelect + preventDefault เพื่อให้ modal เปิดแน่นอน */}
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => setEditOpen(true), 0);
                  }}
                  disabled={busy}
                >
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => setDeleteOpen(true), 0);
                  }}
                  disabled={busy}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Controls */}
          <div className="mt-2 grid gap-4">
            {/* Switch */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-medium" htmlFor={switchId}>
                Enable Detection
              </label>
              <label className={cn("inline-flex items-center cursor-pointer", (disabled || busy) && "cursor-not-allowed opacity-60")}>
                <input
                  type="checkbox"
                  id={switchId}
                  name="enable"
                  className="sr-only peer"
                  checked={!!item.status}
                  onChange={(e) => onToggle?.(item.event_id, e.target.checked)}
                  disabled={disabled || busy}
                />
                <div
                  className={cn(
                    "relative w-14 h-8 rounded-full bg-gray-300 transition-colors duration-200",
                    "peer-checked:bg-[color:var(--color-primary)]",
                    (disabled || busy) && "!bg-gray-200",
                    "after:content-[''] after:absolute after:top-1 after:left-1 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow after:transition-all after:duration-200 peer-checked:after:translate-x-6"
                  )}
                />
              </label>
            </div>

            {/* Sensitivity + Priority (order: low -> critical) */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 items-start gap-3 md:gap-4">
              <div className="min-w-0">
                <label className="text-sm font-medium mb-1 block">Sensitivity</label>
                <Select
                  value={sensitivityValue}
                  onValueChange={(v) => onEdit?.({ ...item, sensitivity: v })}
                  disabled={disabled || busy}
                >
                  <SelectTrigger className="w-full rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] px-2 py-1.5 text-xs sm:text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select
                  value={priorityValue}
                  onValueChange={(v) => onEdit?.({ ...item, priority: v })}
                  disabled={disabled || busy}
                >
                  <SelectTrigger className="w-full rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] px-2 py-1.5 text-xs sm:text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)]">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal แก้ไข (controlled) */}
      <EditEventForm
        item={item}
        endpoint={endpoint}
        hideTrigger
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={(updated) => {
          onEdit?.(updated);
          setEditOpen(false);
        }}
      />

      {/* Modal ยืนยันการลบ — ไม่มีช่องพิมพ์ชื่อ */}
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={(v) => !busy && setDeleteOpen(v)}
        title="Delete Event?"
        description="This action cannot be undone."
        confirmText={busy ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={() => !busy && handleConfirmDelete()}
      />
    </div>
  );
}