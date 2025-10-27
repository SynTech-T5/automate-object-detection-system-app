"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/models/cameras.model";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import * as Lucide from "lucide-react";

/* -------------------------------- Types --------------------------------- */
type Props = { camera: Camera; open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> };
type EventItem = { id: number; name: string; icon?: string };
type SeverityLower = "low" | "medium" | "high" | "critical";
type Me = { usr_id: number; usr_username: string; usr_email: string; usr_role?: string };

type AlertForm = {
  severity: SeverityLower;
  eventId: string;
  description: string;
};

/* ------------------------------ Constants -------------------------------- */
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPT = [
  "image/png", "image/jpeg", "image/webp",
  "video/mp4", "video/quicktime", "video/x-matroska",
];

export default function CreateAlertForm({ camera, open, setOpen }: Props) {
  /* ----------------------------- user (me) ------------------------------ */
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    if (!open) return;
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, [open]);
  const userId = me?.usr_id ?? null;

  /* ----------------------------- camera info --------------------------- */
  const camId = Number((camera as any)?.camera_id ?? (camera as any)?.id);
  const camName = (camera as any)?.camera_name ?? (camera as any)?.name ?? "";
  const camLocation = (camera as any)?.location_name ?? (camera as any)?.location?.name ?? "";
  const camCode = useMemo(() => `CAM${String(camId || 0).padStart(3, "0")}`, [camId]);

  /* ------------------------------- form -------------------------------- */
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [form, setForm] = useState<AlertForm>({
    severity: "high",
    eventId: "",
    description: "",
  });

  function onChange<K extends keyof AlertForm>(key: K, value: AlertForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  /* ----------------------------- events list --------------------------- */
  function normalizeIconName(name?: string) {
    if (!name || typeof name !== "string") return undefined;
    const cleaned = name
      .replace(/[-_ ]+(\w)/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^[a-z]/, c => c.toUpperCase());
    const alias: Record<string, string> = {
      TriangleAlert: "AlertTriangle", Alert: "AlertCircle", Cam: "Camera",
      "wifi-off": "WifiOff", "shield-alert": "ShieldAlert", "camera-off": "CameraOff", motion: "Scan",
    };
    return alias[cleaned] ?? cleaned;
  }

  useEffect(() => {
    if (!open) return;
    setLoadingEvents(true);
    setErrMsg(null);
    fetch("/api/events")
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(payload => {
        const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const normalized: EventItem[] = list
          .map((e: any) => ({
            id: e?.event_id ?? e?.id ?? e?.evt_id,
            name: e?.event_name ?? e?.name ?? e?.evt_name,
            icon: e?.icon_name ?? e?.icon ?? e?.evt_icon,
          }))
          .filter((x: EventItem) => Number.isFinite(x.id) && !!x.name);
        const uniq = [...new Map(normalized.map(v => [v.id, v])).values()];
        setEvents(uniq);
        if (!form.eventId && uniq.length) setForm(prev => ({ ...prev, eventId: String(uniq[0].id) }));
      })
      .catch(() => setErrMsg("Cannot load events."))
      .finally(() => setLoadingEvents(false));
  }, [open]);

  /* ------------------------------- upload ------------------------------ */
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function validateFile(f: File) {
    if (!ACCEPT.includes(f.type)) return `Unsupported file type: ${f.type}`;
    if (f.size > MAX_SIZE) return `File is too large. Max 50MB`;
    return null;
    // หมายเหตุ: ถ้าต้องรองรับ mp4 เฉพาะนามสกุล (บางเบราว์เซอร์ให้ type ว่าง) อาจเช็คจากชื่อไฟล์เสริมได้
  }

  function pickFile(f?: File) {
    setFileErr(null);
    if (!f) { setFile(null); return; }
    const err = validateFile(f);
    if (err) { setFileErr(err); setFile(null); return; }
    setFile(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    pickFile(f || undefined);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    pickFile(f || undefined);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function removeFile() {
    setFile(null);
    setFileErr(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function fmtBytes(n: number) {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  async function uploadFootageIfAny(): Promise<number | null> {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/footages", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Upload failed (${res.status})`);
      }
      const data = await res.json().catch(() => ({}));
      // รองรับหลายรูปแบบตอบกลับ
      const footageId =
        data?.footage_id ??
        data?.id ??
        data?.data?.footage_id ??
        data?.data?.id ??
        null;
      if (!footageId) throw new Error("Upload succeeded but no footage_id returned");
      return Number(footageId);
    } finally {
      setUploading(false);
    }
  }

  /* ------------------------------ submit ------------------------------- */
  const submitDisabled =
    submitting || uploading || !form.eventId || !userId || !camId || loadingEvents;

  // input แบบ lock: หน้าตาปกติ แต่แก้ไม่ได้ + copy ได้
  const lockInputProps = {
    readOnly: true,
    onKeyDown: (ev: React.KeyboardEvent<HTMLInputElement>) => {
      const blocked = ["Backspace", "Delete", "Enter"];
      if (blocked.includes(ev.key) || (ev.ctrlKey && ["x", "v"].includes(ev.key.toLowerCase()))) {
        ev.preventDefault();
      }
    },
    className:
      "w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-[var(--color-primary)] " +
      "border-[#c9d8ff] text-[#1b3fae] bg-[#eef3ff] cursor-default",
    "aria-readonly": true as const,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    setErrMsg(null);

    try {
      setSubmitting(true);

      // 1) ถ้ามีไฟล์ ให้ upload ก่อน
      let footageId: number | null = null;
      if (file) {
        const fid = await uploadFootageIfAny();
        footageId = fid;
      }

      // 2) ยิง POST /api/alerts
      const payload = {
        user_id: Number(userId),
        camera_id: Number(camId),
        footage_id: footageId ?? 1, // ถ้า backend อนุญาตให้เว้นได้ เปลี่ยนเป็น null ได้ตามสเปค
        event_id: Number(form.eventId),
        severity: form.severity, // "low" | "medium" | "high" | "critical"
        description: (form.description || "").trim(),
      };

      const res = await fetch(`/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Create alert failed (${res.status})`);
      }

      setOpen(false);
      window.location.href = "/alerts";
    } catch (err: any) {
      setErrMsg(err?.message || "Create alert failed.");
    } finally {
      setSubmitting(false);
    }
  }

  /* -------------------------------- UI --------------------------------- */
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--color-primary)]">
            New Alert — {camName} (#{camCode})
          </AlertDialogTitle>
          <AlertDialogDescription>
            Fill in alert details below and press New Alert to create the alert.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Camera info (locked) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-semibold">Camera Name</label>
              <input {...lockInputProps} value={camName} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-semibold">Location</label>
              <input {...lockInputProps} value={camLocation} />
            </div>
          </div>

          {/* Severity + Event */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-semibold">Severity</label>
              <Select
                value={form.severity}
                onValueChange={(val) => onChange("severity", val as SeverityLower)}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="{Severity}" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-semibold">Event Type</label>
              <Select
                value={form.eventId}
                onValueChange={(val) => onChange("eventId", val)}
                disabled={loadingEvents || submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose event" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {loadingEvents ? (
                    <SelectItem value="__loading" disabled>Loading...</SelectItem>
                  ) : events.length === 0 ? (
                    <SelectItem value="__empty" disabled>No events</SelectItem>
                  ) : (
                    events.map((evt) => {
                      const iconName = normalizeIconName(evt.icon);
                      // @ts-ignore
                      const IconComp = (iconName && (Lucide as any)[iconName]) || Lucide.Dot;
                      return (
                        <SelectItem key={evt.id} value={String(evt.id)} textValue={evt.name}>
                          <div className="flex min-w-0 items-center gap-2">
                            <IconComp className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                            <span className="truncate" title={evt.name}>{evt.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-1">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              placeholder="Enter your description"
              className="w-full rounded-md border px-3 py-3 outline-none focus:ring focus:ring-[var(--color-primary)] border-gray-300"
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              disabled={submitting}
              rows={4}
            />
          </div>

          {/* Upload File (Drag & Drop or Choose) */}
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Upload File</label>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className={[
                "rounded-xl border border-dashed",
                "border-gray-300 bg-white",
                "px-4 py-8 text-center select-none",
              ].join(" ")}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT.join(",")}
                className="hidden"
                onChange={onInputChange}
              />

              {!file ? (
                <div className="flex flex-col items-center gap-3">
                  <Lucide.UploadCloud className="w-8 h-8 opacity-60" />
                  <div className="text-gray-500">
                    Drag and Drop file here or{" "}
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="underline text-[var(--color-primary)]"
                    >
                      Choose file
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">Maximum size 50MB</div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-left">
                    <Lucide.File className="w-4 h-4 opacity-60" />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.type || "unknown"} • {fmtBytes(file.size)}</div>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" onClick={removeFile} className="h-8 px-2">
                    <Lucide.X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {fileErr && <div className="text-sm text-red-600">{fileErr}</div>}
          </div>

          {errMsg && <div className="text-sm text-red-600">{errMsg}</div>}
          {!userId && (
            <div className="text-sm text-amber-600">Please sign in to create an alert.</div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50" disabled={submitting || uploading}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={submitDisabled || !!fileErr}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-5 rounded-md disabled:opacity-50"
            >
              {uploading ? "Uploading..." : submitting ? "Saving..." : "New Alert"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}