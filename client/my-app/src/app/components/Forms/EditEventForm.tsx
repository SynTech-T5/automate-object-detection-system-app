'use client';

import { useEffect, useState } from "react";
import IconPickerInput from "../Utilities/IconPickerInput";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import type { Event } from "../../models/events.model";

type Lmhc = "low" | "medium" | "high" | "critical";

export default function EditEventForm({
  item,
  endpoint = "/api/events",
  onUpdated,
  triggerClassName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: {
  item: Event;
  endpoint?: string;
  onUpdated?: (updated: Event) => void;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  // Prefill
  const [icon, setIcon] = useState<string | undefined>(item.icon_name || "AlertTriangle");
  const [name, setName] = useState<string>(item.event_name || "");
  const [sensitivity, setSensitivity] = useState<Lmhc>((item.sensitivity as Lmhc) || "medium");
  const [priority, setPriority] = useState<Lmhc>((item.priority as Lmhc) || "medium");
  const [enabled, setEnabled] = useState<boolean>(!!item.status);
  const [description, setDescription] = useState<string>(item.description || "");

  useEffect(() => {
    setIcon(item.icon_name || "AlertTriangle");
    setName(item.event_name || "");
    setSensitivity((item.sensitivity as Lmhc) || "medium");
    setPriority((item.priority as Lmhc) || "medium");
    setEnabled(!!item.status);
    setDescription(item.description || "");
    setErrors({});
  }, [item]);

  function authHeaders(): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (process.env.NEXT_PUBLIC_TOKEN) {
      h.Authorization = `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`;
    }
    return h;
  }

  async function updateEvent(payload: {
    icon_name: string;
    event_name: string;
    description: string;
    sensitivity: Lmhc;
    priority: Lmhc;
    status: boolean;
  }) {
    const res = await fetch(`${endpoint}/${item.event_id}`, {
      method: "PUT",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.message || "Failed to update Event.";
      const err: any = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return (data?.data ?? data) as Event;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        icon_name: icon || "AlertTriangle",
        event_name: name?.trim() || "Untitled Event",
        description: description || "—",
        sensitivity,
        priority,
        status: enabled,
      };

      const updated = await updateEvent(payload);
      onUpdated?.(updated);
      setOpen(false);
      window.location.href = "/cameras";
    } catch (e: any) {
      if (e?.status === 400 && /exists|duplicate/i.test(e?.message || "")) {
        setErrors({ name: "Event name already exists" });
      } else {
        setErrors({ general: e?.message ?? "Submit failed" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <AlertDialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className={triggerClassName ?? "bg-[#0B63FF] text-white hover:bg-[#0a55cc] flex items-center gap-2"}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <form id="editEventForm" onSubmit={onSubmit} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--color-primary)]">
              Edit Event – {item.event_name} (#{`EVT${String(item.event_id).padStart(3, "0")}`})
            </AlertDialogTitle>
            <AlertDialogDescription>
              Update fields and click Save Changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3">
            {/* Event Name + Icon */}
            <div className="grid gap-1">
              <Label className="text-sm font-medium text-black" htmlFor="name">
                Event Name
              </Label>
              <input type="hidden" name="icon" value={icon} />
              <IconPickerInput
                icon={icon}
                onIconChange={setIcon}
                value={name}
                onChange={(v: string) => {
                  setName(v);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                inputId="name"
                inputName="name"
                placeholder="Enter event name"
                inputClassName={
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Sensitivity & Priority — สไตล์ตามที่ขอ + ลำดับ low→critical */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-black" htmlFor="sensitivity">
                  Sensitivity
                </Label>
                <Select value={sensitivity} onValueChange={(v: Lmhc) => setSensitivity(v)} name="sensitivity">
                  <SelectTrigger
                    id="sensitivity"
                    className="w-full rounded-md border border-gray-300
                     bg-white text-sm text-black
                     focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                     px-3 py-2"
                  >
                    <SelectValue placeholder="Choose sensitivity" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)] text-black">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label className="text-sm font-medium text-black" htmlFor="priority">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(v: Lmhc) => setPriority(v)} name="priority">
                  <SelectTrigger
                    id="priority"
                    className="w-full rounded-md border border-gray-300
                     bg-white text-sm text-black
                     focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                     px-3 py-2"
                  >
                    <SelectValue placeholder="Choose priority" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)] text-black">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Enable Detection */}
            <div className="grid gap-1">
              <Label className="text-sm font-medium text-black" htmlFor="enable">
                Enable Detection
              </Label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="enable"
                  name="enable"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className="relative w-16 h-9 rounded-full
                              bg-gray-300 peer-checked:bg-[color:var(--color-primary)]
                              transition-colors duration-200
                              after:content-[''] after:absolute after:top-1 after:left-1
                              after:w-7 after:h-7 after:bg-white after:rounded-full
                              after:shadow after:transition-all after:duration-200
                              peer-checked:after:translate-x-7">
                </div>
              </label>
            </div>

            {/* Description */}
            <div className="grid gap-1">
              <Label className="text-sm font-medium text-black" htmlFor="description">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="font-light w-full rounded-md border border-gray-300 bg-white text-black px-3 py-3 outline-none
                           focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>

            {/* General error */}
            {errors.general && (
              <p className="text-sm text-red-600">{errors.general}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>

            <Button
              type="submit"
              form="editEventForm"
              disabled={submitting}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}