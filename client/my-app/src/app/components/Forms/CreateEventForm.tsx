'use client';

import { useState } from "react";
import IconPickerInput from "../Utilities/IconPickerInput";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

type Lmhc = "low" | "medium" | "high" | "critical";

export default function CreateEventForm() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  // ฟิลด์ฟอร์ม
  const [icon, setIcon] = useState<string | undefined>("AlertTriangle");
  const [name, setName] = useState("");
  const [sensitivity, setSensitivity] = useState<Lmhc>("high");
  const [priority, setPriority] = useState<Lmhc>("critical");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [description, setDescription] = useState("");

  function authHeaders(): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (process.env.NEXT_PUBLIC_TOKEN) {
      h.Authorization = `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`;
    }
    return h;
  }

  async function createEvent(payload: {
    icon_name: string;
    event_name: string;
    description: string;
    sensitivity: Lmhc;
    priority: Lmhc;
    status: boolean;
  }) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err: any = new Error(data?.message || "Failed to add new Event.");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await createEvent({
        icon_name: icon || "AlertTriangle",
        event_name: name || "Untitled Event",
        description: description || "—",
        sensitivity,
        priority,
        status: enabled,
      });

      setOpen(false);

      window.location.href = "/cameras";

    } catch (e: any) {
      if (e?.status === 400 && /exists/i.test(e?.message || "")) {
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
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#0077FF] text-white hover:bg-[#0063d6] flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Event
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <form id="userForm" onSubmit={onSubmit} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--color-primary)]">
              Add New Event
            </AlertDialogTitle>
            <AlertDialogDescription>
              Fill in the details and click Add New.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3">
            {/* Event Name + Icon Picker */}
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
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
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

            {/* Sensitivity & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-black" htmlFor="sensitivity">
                  Sensitivity
                </Label>
                <Select value={sensitivity} onValueChange={(v: Lmhc) => setSensitivity(v)} name="sensitivity">
                  <SelectTrigger
                    id="sensitivity"
                    className="w-full rounded-md border border-gray-300 bg-white text-sm text-black
                               focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-3 py-2"
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
                    className="w-full rounded-md border border-gray-300 bg-white text-sm text-black
                               focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-3 py-2"
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
              form="userForm"
              disabled={submitting}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Add New"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}