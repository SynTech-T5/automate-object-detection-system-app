'use client';

import { useEffect, useState } from "react";
import IconPickerInput from "./IconPickerInput";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Sensitivity = "Critical" | "High" | "Medium" | "Low";

export interface EventRecord {
  id: number;
  name: string;
  icon: string;
  description: string;
  sensitivity: Sensitivity;
  status: boolean; // evt_status
}

type EditEventFormProps = {
  /** ควบคุม open จาก component ภายนอก */
  open: boolean;
  setOpen: (open: boolean) => void;

  /** ส่ง event object ที่กดมาเข้ามา (ใช้ prefill) */
  event: EventRecord | null;

  /** callback เรียกหลังบันทึกสำเร็จ พร้อมส่ง object ที่อัปเดตแล้วกลับไปให้ผู้เรียก */
  onSaved?: (updated: EventRecord) => void;
};

export default function EditEventForm({ open, setOpen, event, onSaved }: EditEventFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string>("");

  // local states สำหรับควบคุม input (sync ใหม่ทุกครั้งที่ event เปลี่ยน)
  const [icon, setIcon] = useState<string | undefined>("TriangleAlert");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sensitivity, setSensitivity] = useState<Sensitivity>("High");
  const [status, setStatus] = useState<boolean>(true);

  useEffect(() => {
    if (!event) return;
    setIcon(event.icon ?? "TriangleAlert");
    setName(event.name ?? "");
    setDescription(event.description ?? "");
    setSensitivity((event.sensitivity as Sensitivity) ?? "High");
    setStatus(Boolean(event.status));
    setErr("");
  }, [event, open]);

  async function putEvent(id: number, payload: Partial<EventRecord>): Promise<EventRecord> {
    const res = await fetch(`/api/events/${id}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to update Event.");
    }
    return res.json();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;

    setErr("");
    setSubmitting(true);
    try {
      const payload: Partial<EventRecord> = {
        name,
        icon: icon || "",
        description,
        sensitivity,
        status,
      };

      const updated = await putEvent(event.id, payload);

      // ส่ง object ที่อัปเดตกลับไปให้ component แม่ใช้งานต่อ
      onSaved?.(updated);

      setOpen(false);
    } catch (e: any) {
      setErr(e?.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <form id="editEventForm" onSubmit={onSubmit} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Event</AlertDialogTitle>
            <AlertDialogDescription>
              Update the details and click Save changes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3">
            {/* Name + Icon */}
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="name">
                Event Name
              </label>

              {/* ถ้า IconPickerInput ไม่ได้สร้าง input ชื่อ icon เอง ให้มี hidden ไว้ */}
              <input type="hidden" name="icon" value={icon} />

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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                  className="w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value as Sensitivity)}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Enable Detection (status) */}
              <div>
                <label className="text-sm font-medium" htmlFor="enable">
                  Enable Detection
                </label>
                <label className="mt-1 inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="enable"
                    name="enable"
                    className="sr-only peer"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                  />
                  <span
                    className="relative w-16 h-9 rounded-full
                               bg-gray-300 peer-checked:bg-[color:var(--color-primary)]
                               transition-colors duration-200
                               after:content-[''] after:absolute after:top-1 after:left-1
                               after:w-7 after:h-7 after:bg-white after:rounded-full
                               after:shadow after:transition-all after:duration-200
                               peer-checked:after:translate-x-7"
                  />
                </label>
              </div>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}
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
              disabled={submitting || !event}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// import { useState } from "react";
// import EditEventForm, { EventRecord } from "./EditEventForm";

// export default function EventsPage() {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
//   const [events, setEvents] = useState<EventRecord[]>([]);

//   function onClickEdit(ev: EventRecord) {
//     setSelectedEvent(ev);   // ส่ง event object ที่กดมา
//     setDialogOpen(true);    // เปิด dialog จากภายนอก
//   }

//   function handleSaved(updated: EventRecord) {
//     // อัปเดต list ในหน้า
//     setEvents((prev) => prev.map(e => e.id === updated.id ? updated : e));
//   }

//   return (
//     <>
//       {/* ... ตารางรายการ ... */}
//       {/* <button onClick={() => onClickEdit(ev)}>Edit</button> */}

//       <EditEventForm
//         open={dialogOpen}
//         setOpen={setDialogOpen}
//         event={selectedEvent}
//         onSaved={handleSaved}
//       />
//     </>
//   );
// }
