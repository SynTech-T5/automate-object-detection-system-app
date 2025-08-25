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

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ตัวอย่างคอมโพเนนต์ย่อย (เปลี่ยนเป็นของจริงได้)
function HealthStatus() { return <div>Overall Health…</div>; }
function EventDetection() { return <div>Event logs / charts…</div>; }
function AccessControl() { return <div>Door events…</div>; }
function Maintenance() { return <div>Tickets & schedules…</div>; }


type Sensitivity = "Critical" | "High" | "Medium" | "Low";

interface EventPayload {
  name: string;
  icon: string;
  description: string;
  sensitivity: Sensitivity;
  status?: boolean;
}

export default function CameraDetails() {
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
          Details
        </Button>
      </AlertDialogTrigger>
  
      <AlertDialogContent
        className="
          !p-0 rounded-2xl ring-1 ring-black/5 shadow-xl
          !w-[90vw] sm:!w-[88vw] !max-w-[880px]
          !overflow-hidden min-w-0         /* ← ตัดตามรัศมีมุม ไม่ให้มุมแหลมโผล่ */
          sm:max-h-[85vh] sm:h-auto
        "
      >
        <form id="userForm" onSubmit={onSubmit} className="flex h-full flex-col min-w-0">
          {/* Header */}
          <div className="px-5 pt-5 bg-white">
            <AlertDialogHeader className="p-0">
              <AlertDialogTitle className="text-[var(--color-primary)] text-lg font-semibold">
                Camera Details:
              </AlertDialogTitle>
            </AlertDialogHeader>
          </div>
  
          {/* Body: mobile = horizontal scroll, desktop = vertical scroll */}
          <div
            className="
              flex-1 min-h-0 min-w-0 bg-white
              px-4 sm:px-4 py-3 sm:py-3
              space-y-3
              overflow-x-auto overflow-y-hidden   /* มือถือเลื่อนแนวนอน */
              sm:overflow-x-hidden sm:overflow-y-auto  /* เดสก์ท็อปเลื่อนแนวตั้ง */
              overscroll-x-contain touch-pan-x
            "
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* ทำให้จอเล็กเลื่อนแนวนอนได้ แต่เลย์เอาต์คงเดิม */}
            <div className="min-w-[960px] sm:min-w-0">
              {/* Main two-column layout: บังคับ 2 คอลัมน์ทุกขนาดจอ */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left: image with overlay button */}
                <div className="relative h-[200px] sm:h-[300px] rounded-md overflow-hidden">
                  <img
                    src="/library-room.jpg"
                    onError={(e) => ((e.currentTarget.src = "/api/placeholder/800/600"))}
                    alt="Camera snapshot"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    className="absolute bottom-3 right-3 px-5 py-2 shadow-lg bg-[#0077FF] hover:bg-[#0063d6] text-white rounded-xl"
                    onClick={() => { /* open live view */ }}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                    View
                  </Button>
                </div>
  
                {/* Right: camera information */}
                <div>
                  <div className="text-[var(--color-primary)] text-base mb-3">
                    Camera Information
                  </div>
  
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Camera ID</dt>
                      <dd className="text-gray-900 text-sm">CAM001</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Status</dt>
                      <dd className="text-gray-900 text-sm">Active</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Location</dt>
                      <dd className="text-gray-900 text-sm">Main Entrance</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Type</dt>
                      <dd className="text-gray-900 text-sm">PTZ</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">IP Address</dt>
                      <dd className="text-gray-900 text-sm">192.168.1.101</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Resolution</dt>
                      <dd className="text-gray-900 text-sm">1080p</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Installation Date</dt>
                      <dd className="text-gray-900 text-sm">2025-05-15 at 10:08:19 PM</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-gray-500 text-xs">Last Maintenance</dt>
                      <dd className="text-gray-900 text-sm">2025-05-15 at 10:08:19 PM</dd>
                    </div>
                  </dl>
                </div>
              </div>
  
              {/* Tabs */}
              <Tabs defaultValue="health" className="mt-3">
                <TabsList className="w-full justify-start bg-transparent p-0 border-b border-gray-200 rounded-none text-base whitespace-nowrap">
                  {[
                    { id: "health", label: "Health Status" },
                    { id: "event", label: "Event Detection" },
                    { id: "access", label: "Access Control" },
                    { id: "maint", label: "Maintenance" },
                  ].map((t) => (
                    <TabsTrigger
                      key={t.id}
                      value={t.id}
                      className="
                        relative mr-6 h-9 px-0 bg-transparent rounded-none
                        font-medium
                        text-gray-500 data-[state=active]:text-[var(--color-primary)]
                        shadow-none data-[state=active]:shadow-none
                        after:absolute after:left-0 after:-bottom-[1px]
                        after:h-[2px] after:w-0 after:bg-[var(--color-primary)]
                        data-[state=active]:after:w-full
                        transition-all
                      "
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
  
                <TabsContent value="health" className="mt-5 focus-visible:outline-none">
                  <HealthStatus />
                </TabsContent>
                <TabsContent value="event" className="mt-5 focus-visible:outline-none">
                  <EventDetection />
                </TabsContent>
                <TabsContent value="access" className="mt-5 focus-visible:outline-none">
                  <AccessControl />
                </TabsContent>
                <TabsContent value="maint" className="mt-5 focus-visible:outline-none">
                  <Maintenance />
                </TabsContent>
              </Tabs>
            </div>
          </div>
  
          {/* Footer */}
          <div className="px-5 py-3 bg-white">
            <AlertDialogFooter className="p-0">
              <AlertDialogCancel
                disabled={submitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}