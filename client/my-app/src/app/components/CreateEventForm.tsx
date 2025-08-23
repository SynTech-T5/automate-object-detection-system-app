'use client';

import { useState } from "react";
import IconPickerInput from "./IconPickerInput";
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

type Sensitivity = "Critical" | "High" | "Medium" | "Low";

interface EventPayload {
  name: string;
  icon: string;
  description: string;
  sensitivity: Sensitivity;
  status?: boolean;
}

export default function CreateEventForm() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string>("");
  const [icon, setIcon] = useState<string | undefined>("TriangleAlert");
  const [name, setName] = useState("");

  async function postEvent(payload: EventPayload): Promise<EventPayload> {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to add new Event.");
    }
    return res.json();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      const fd = new FormData(e.currentTarget);

      const payload: EventPayload = {
        name: (fd.get("name") as string) || "",
        icon: (fd.get("icon") as string) || "",
        description: (fd.get("description") as string) || "",
        sensitivity: (fd.get("sensitivity") as Sensitivity) || "High",
        status: fd.get("enable") === "on" ? true : false,
      };

      await postEvent(payload);
      setOpen(false);
      // window.location.href = "/cameras";
    } catch (e: any) {
      setErr(e?.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#0077FF] text-white hover:bg-[#0063d6]"
        >
          New Event
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <form id="userForm" onSubmit={onSubmit} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Event</AlertDialogTitle>
            <AlertDialogDescription>
              Fill in the details and click Add New.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3">
            {/* Name + Icon */}
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="name">
                Event Name
              </label>

              {/* ถ้า IconPickerInput ไม่ได้เรนเดอร์ input จริงที่มี name, เราเพิ่ม hidden เอง */}
              <input type="hidden" name="icon" value={icon} />

              {/* ให้มี input ที่มี name="name" ชัดเจน */}
              {/* ถ้า IconPickerInput มี text input อยู่แล้ว ให้ส่ง name="name" ไปให้มันด้วย */}
              <IconPickerInput
                icon={icon}
                onIconChange={setIcon}
                value={name}
                onChange={setName}
                inputId="name"
                inputName="name"
                placeholder="Enter event name"
              />
            </div>

            {/* Description */}
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter your description"
                className="font-light w-full rounded-md border px-3 py-3 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Sensitivity */}
              <div className="col-span-2">
                <label className="text-sm font-medium" htmlFor="sensitivity">
                  Sensitivity
                </label>
                <select
                  id="sensitivity"
                  name="sensitivity"
                  defaultValue="High"
                  className="w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Enable Detection */}
              <div className="">
                <label className="text-sm font-medium" htmlFor="enable">
                  Enable Detection
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="enable" name="enable" className="sr-only peer" />
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
            </div>
            {/* {err && <p className="text-sm text-red-600">{err}</p>} */}
            {err && <p className="text-sm text-red-600">Something wrong!</p>}
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