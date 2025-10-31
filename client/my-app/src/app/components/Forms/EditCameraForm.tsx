"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useMe } from "@/hooks/useMe";

type Props = {
  camId: number;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type ApiLocation = {
  location_id: number;
  location_name: string;
};

type EditForm = {
  camera_name: string;
  camera_type: "fixed" | "ptz" | "panoramic" | "thermal";
  camera_status: boolean;
  source_type: "url" | "address";
  source_value: string;
  location_id: number | "";
  description: string;
};

function normalizeType(t: unknown): EditForm["camera_type"] {
  const v = String(t ?? "").toLowerCase();
  const ok = ["fixed", "ptz", "panoramic", "thermal"] as const;
  return (ok.includes(v as any) ? v : "fixed") as EditForm["camera_type"];
}
function normalizeSourceType(s: unknown): EditForm["source_type"] {
  const v = String(s ?? "").toLowerCase();
  return v === "address" ? "address" : "url";
}

export default function EditCameraModal({ camId, open, setOpen }: Props) {
  const { me, loading: loadingMe, error: meError } = useMe();

  const [form, setForm] = useState<EditForm>({
    camera_name: "",
    camera_type: "fixed",
    camera_status: true,
    source_type: "url",
    source_value: "",
    location_id: "",
    description: "",
  });

  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationsError, setLocationsError] = useState<string>("");
  const [currentCamera, setCurrentCamera] = useState<EditForm>();

  const [loadingCamera, setLoadingCamera] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // เก็บชื่อสถานที่จาก API (เพราะ API ไม่มี location_id)
  const [cameraLocationName, setCameraLocationName] = useState<string>("");

  /* -------------------- โหลดข้อมูลกล้อง (GET /api/cameras/:id) -------------------- */
  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      try {
        setLoadingCamera(true);
        setErrMsg(null);

        const res = await fetch(`/api/cameras/${camId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          credentials: "include",
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.message || `Load camera failed (${res.status})`);

        // รูปแบบใหม่: { message, data: [ {...} ] }
        const arr: any[] = Array.isArray(payload?.data) ? payload.data : [];
        if (!arr.length) throw new Error("Camera not found.");
        const c = arr[0];
        setCurrentCamera(c);

        const next: EditForm = {
          camera_name: c.camera_name ?? "",
          camera_type: normalizeType(c.camera_type),
          camera_status: typeof c.camera_status === "boolean" ? c.camera_status : true,
          source_type: normalizeSourceType(
            c.source_type ?? (String(c.source_value ?? "").startsWith("rtsp://") ? "url" : "address")
          ),
          source_value: c.source_value ?? "",
          location_id: "", // map จาก location_name หลังจากโหลด locations
          description: c.description ?? "",
        };

        if (mounted) {
          setForm(next);
          setCameraLocationName(String(c.location_name ?? "").trim());
        }
      } catch (e: any) {
        if (mounted) setErrMsg(e?.message || "Failed to load camera.");
      } finally {
        if (mounted) setLoadingCamera(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, camId]);

  /* -------------------- โหลด Locations (GET /api/locations) -------------------- */
  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      try {
        setLoadingLocations(true);
        setLocationsError("");

        const res = await fetch(`/api/locations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const payload: { message?: string; data?: ApiLocation[] } = await res.json().catch(() => ({} as any));
        if (!res.ok) throw new Error(payload?.message || `Load locations failed (${res.status})`);

        const arr = Array.isArray(payload?.data) ? payload.data! : [];
        if (mounted) setLocations(arr);
      } catch (e: any) {
        if (mounted) {
          setLocations([]);
          setLocationsError(e?.message || "Failed to load locations");
        }
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open]);

  /* -------- map location_name → location_id เมื่อมีข้อมูลทั้งสองฝั่งพร้อม -------- */
  useEffect(() => {
    if (!cameraLocationName || !locations.length) return;
    const key = cameraLocationName.trim().toLowerCase();
    const found = locations.find(
      (l) => (l.location_name ?? "").trim().toLowerCase() === key
    );
    if (found && form.location_id === "") {
      setForm((prev) => ({ ...prev, location_id: found.location_id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraLocationName, locations]);

  /* -------------------------------- handlers -------------------------------- */
  const onText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const onSelect = (name: keyof EditForm) => (value: string) => {
    if (name === "camera_type") {
      setForm((prev) => ({ ...prev, camera_type: normalizeType(value) }));
    } else if (name === "source_type") {
      setForm((prev) => ({ ...prev, source_type: normalizeSourceType(value) }));
    } else if (name === "location_id") {
      const v = value ? Number(value) : "";
      setForm((prev) => ({ ...prev, location_id: v as any }));
    }
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault?.();
    setErrMsg(null);

    // validate
    if (!form.camera_name?.trim()) return setErrMsg("Camera name is required.");
    if (!form.source_value?.trim()) return setErrMsg("Source value is required.");
    if (!(Number.isFinite(form.location_id) && Number(form.location_id) > 0)) {
      return setErrMsg("Please choose a valid location.");
    }

    // user_id จาก /api/auth/me (ผ่าน useMe)
    const user_id = Number((me as any)?.usr_id);
    if (!Number.isFinite(user_id) || user_id <= 0) {
      return setErrMsg(meError || "Cannot resolve user_id from current user.");
    }

    // payload ให้ตรงกับ backend updateCamera(
    //   camera_id, camera_name, camera_type, camera_status, source_type,
    //   source_value, location_id, description, user_id
    // )
    const payload = {
      camera_id: Number(camId),
      camera_name: form.camera_name.trim(),
      camera_type: (form.camera_type || "fixed").toLowerCase() as EditForm["camera_type"],
      camera_status: !!form.camera_status,
      source_type: form.source_type, // "url" | "address"
      source_value: form.source_value.trim(),
      location_id: Number(form.location_id),
      description: form.description?.trim() ?? "",
      user_id,
    };

    try {
      setSubmitting(true);
      const res = await fetch(`/api/cameras/${camId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Update failed");

      setOpen(false);
      // ถ้าอยากให้สวยหน่อย อาจจะแค่ refresh data ของ list แทน reload ทั้งหน้า
      window.location.reload();
    } catch (e: any) {
      setErrMsg(e?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  const camCode = `CAM${String(camId).padStart(3, "0")}`;

  /* --------------------------------- UI --------------------------------- */
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="!top-[40%] !-translate-y-[40%] max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--color-primary)]">
            Settings – {currentCamera?.camera_name} (#{camCode})
          </AlertDialogTitle>
          <AlertDialogDescription>
            Adjust camera configurations and click Save.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Camera Type + Camera Name */}
          <div className="grid grid-cols-3 gap-2">
            <div className="grid gap-1">
              <Label className="text-sm font-medium text-black" htmlFor="camera_type">
                Camera Type
              </Label>
              <Select
                value={form.camera_type}
                onValueChange={onSelect("camera_type")}
              >
                <SelectTrigger
                  id="camera_type"
                  className="w-full rounded-md border border-gray-300 bg-white text-sm text-black focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-3 py-2"
                >
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent className="border-[var(--color-primary)] text-black">
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="ptz">PTZ</SelectItem>
                  <SelectItem value="panoramic">Panoramic</SelectItem>
                  <SelectItem value="thermal">Thermal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 gap-1">
              <label className="text-sm font-medium" htmlFor="camera_name">
                Camera Name
              </label>
              <input
                id="camera_name"
                name="camera_name"
                value={form.camera_name}
                onChange={onText}
                placeholder="Max 32 characters"
                className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                required
                disabled={loadingCamera}
              />
            </div>
          </div>

          {/* Source Type + Source Value */}
          <div className="grid grid-cols-3 gap-2">
            <div className="grid gap-1">
              <Label className="text-sm font-medium text-black" htmlFor="source_type">
                Source Type
              </Label>
              <Select
                value={form.source_type}
                onValueChange={onSelect("source_type")}
              >
                <SelectTrigger
                  id="source_type"
                  className="w-full rounded-md border border-gray-300 bg-white text-sm text-black focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-3 py-2"
                >
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent className="border-[var(--color-primary)] text-black">
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="address">IP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 gap-1">
              <label className="text-sm font-medium" htmlFor="source_value">
                Source Value
              </label>
              <input
                id="source_value"
                name="source_value"
                value={form.source_value}
                onChange={onText}
                placeholder="Enter camera source"
                className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                required
                disabled={loadingCamera}
              />
            </div>
          </div>

          {/* Location + Status */}
          <div className="grid grid-cols-3 gap-2">
            {/* Location */}
            <div className="col-span-2 grid gap-1">
              <Label className="text-sm font-medium text-black" htmlFor="location_id">
                Location
              </Label>

              <Select
                value={form.location_id === "" ? "" : String(form.location_id)}
                onValueChange={onSelect("location_id")}
              >
                <SelectTrigger
                  id="location_id"
                  className="w-full rounded-md border border-gray-300 bg-white text-sm text-black focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-3 py-2"
                >
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>

                <SelectContent className="border-[var(--color-primary)] text-black">
                  {loadingLocations && (
                    <SelectItem disabled value="__loading">
                      Loading locations…
                    </SelectItem>
                  )}
                  {locations.map((loc) => (
                    <SelectItem key={loc.location_id} value={String(loc.location_id)}>
                      {loc.location_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {locationsError && (
                <p className="text-xs text-red-600 mt-1">{locationsError}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="camera_status">
                Status
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="camera_status"
                  name="camera_status"
                  className="sr-only peer"
                  checked={!!form.camera_status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, camera_status: e.target.checked }))
                  }
                />
                <div
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
              value={form.description}
              onChange={onText}
              disabled={loadingCamera}
            />
          </div>

          {errMsg && <div className="text-sm text-red-600">{errMsg}</div>}

          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              onClick={(e) => handleSubmit(e as any)}
              disabled={submitting || loadingCamera || loadingMe}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}