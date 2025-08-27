'use client';

import { useEffect, useRef, useState } from "react";
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
import { Cctv } from "lucide-react";
import { useMe } from "@/hooks/useMe";

interface CameraForm {
  cam_name: string;
  cam_address: string;
  cam_type: string;
  cam_resolution: string;
  cam_description: string;
  cam_status: boolean;
  cam_location_id: number;
}

type LocationItem = { id: number; name: string };

export default function Page() {
  // Modal states
  const [openForm, setOpenForm] = useState(false);     // Modal 1: Add New Camera
  const [openAuth, setOpenAuth] = useState(false);     // Modal 2: Authentication
  const [submitting, setSubmitting] = useState(false);

  // Errors
  const [err, setErr] = useState<string>("");          // error แสดงในฟอร์ม (ถ้ามี)
  const [authErr, setAuthErr] = useState<string>("");  // error ใน modal auth

  // Refs / auth state
  const formRef = useRef<HTMLFormElement | null>(null);
  const [authPassword, setAuthPassword] = useState("");

  // user
  const { me, loading, error: meError } = useMe();

  // ----- local state for selects (no props needed) -----
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState<string>("");

  const [types, setTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState<string>("");

  useEffect(() => {
    const ac = new AbortController();

    // 1) fetch locations
    (async () => {
      try {
        setLoadingLocations(true);
        setLocationsError("");
        const res = await fetch("/api/cameras/location", {
          cache: "no-store",
          credentials: "include",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to load locations");
        const raw = await res.json();

        const normalized: LocationItem[] = (Array.isArray(raw) ? raw : []).map((l: any) => ({
          id: l?.id ?? l?.loc_id ?? l?.location_id,
          name: l?.name ?? l?.loc_name ?? l?.location_name ?? l?.location,
        })).filter((x: LocationItem) => Number.isFinite(x.id) && !!x.name);

        const uniq = Array.from(new Map(normalized.map(v => [v.id, v])).values());
        setLocations(uniq);
      } catch (e: any) {
        if (e?.name !== "AbortError") setLocationsError(e?.message || "Load locations error");
      } finally {
        setLoadingLocations(false);
      }
    })();

    // 2) fetch types
    (async () => {
      try {
        setLoadingTypes(true);
        setTypesError("");
        const res = await fetch("/api/cameras", {
          cache: "no-store",
          credentials: "include",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(await res.text() || "Failed to load camera types");
        const cams = await res.json();
        const uniqTypes = Array.from(new Set(
          (Array.isArray(cams) ? cams : [])
            .map((c: any) => c?.type ?? c?.cam_type ?? c?.camType)
            .filter(Boolean)
        )).sort();
        setTypes(uniqTypes);
      } catch (e: any) {
        if (e?.name !== "AbortError") setTypesError(e?.message || "Load types error");
      } finally {
        setLoadingTypes(false);
      }
    })();

    return () => ac.abort();
  }, []);

  async function createCamera(payload: CameraForm): Promise<CameraForm> {
    const res = await fetch("/api/cameras/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.json();
      throw new Error(text.message || "Failed to Create");
    }
    return res.json();
  }

  // ขั้นตอน: ตรวจฟอร์ม -> เปิด Auth modal
  function handleOpenAuth() {
    setErr("");
    setAuthErr("");

    const form = formRef.current;
    if (!form) return;
    // ให้เบราว์เซอร์เช็ค required field ก่อน
    const ok = form.reportValidity();
    if (!ok) return;

    setOpenAuth(true);
  }

  // ขั้นตอน: Confirm ใน Auth modal -> เช็คพาส -> สร้างกล้อง
  async function handleConfirmCreate() {
    if (!formRef.current) return;
    setSubmitting(true);
    setAuthErr("");

    try {
      // 1) recheck auth
      const check = await fetch("/api/auth/recheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: authPassword }),
      });
      if (!check.ok) {
        throw new Error("Password incorrect, please try again.");
      }

      // 2) gather form data (ยังไม่ปิด modal ฟอร์ม เพื่อ allow back-edit)
      const fd = new FormData(formRef.current);
      const payload: CameraForm = {
        cam_name: String(fd.get("name") ?? ""),
        cam_address: String(fd.get("address") ?? ""),
        cam_type: String(fd.get("type") ?? "Fixed"),
        cam_resolution: String(fd.get("resolution") ?? "1080p"),
        cam_description: String(fd.get("description") ?? ""),
        cam_status: Boolean(fd.get("status")),
        cam_location_id: parseInt(String(fd.get("location") ?? "0"), 10),
      };

      if (!Number.isFinite(payload.cam_location_id) || payload.cam_location_id <= 0) {
        throw new Error("Please choose a valid location.");
      }

      // 3) create
      await createCamera(payload);

      // 4) success → ปิดทั้งสอง modal แล้ว redirect
      setOpenAuth(false);
      setOpenForm(false);
      window.location.href = "/cameras";
    } catch (e: any) {
      setAuthErr(e?.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Trigger เปิดฟอร์ม (Modal 1) */}
      <AlertDialog open={openForm} onOpenChange={(v) => {
        setOpenForm(v);
        if (!v) {
          // reset auth modal เมื่อปิดฟอร์ม
          setOpenAuth(false);
          setAuthPassword("");
          setErr("");
          setAuthErr("");
        }
      }}>
        <AlertDialogTrigger asChild>
          <Button
            onClick={() => setOpenForm(true)}
            className="bg-[#0077FF] text-white hover:bg-[#0063d6]"
          >
            <Cctv size={16} />
            Add New Camera
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
          <form ref={formRef} id="cameraForm" className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[var(--color-primary)]">Add New Camera</AlertDialogTitle>
              <AlertDialogDescription>
                Fill in the details and click Add New.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Camera Name */}
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="name">
                Camera Name
              </label>
              <input
                id="name"
                name="name"
                placeholder="Enter your camera name"
                className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                required
              />
            </div>

            {/* IP Address */}
            <div className="grid gap-1">
              <label className="text-sm font-medium" htmlFor="address">
                IP Address
              </label>
              <input
                id="address"
                name="address"
                placeholder="Enter your IP Address"
                className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Camera Type */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="type">
                  Camera Type
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue="Fixed"
                  className="w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                >
                  {/* ถ้าอยากใช้ types จาก API ให้ map จาก state แทน */}
                  <option value="Fixed">Fixed</option>
                  <option value="PTZ">PTZ</option>
                  <option value="Panoramic">Panoramic</option>
                  <option value="Thermal">Thermal</option>
                </select>
              </div>

              {/* Resolution */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="resolution">
                  Resolution
                </label>
                <select
                  id="resolution"
                  name="resolution"
                  defaultValue="1080p"
                  className="w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Location */}
              <div className="col-span-2">
                <label className="text-sm font-medium" htmlFor="location">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  defaultValue=""
                  className="w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                  required
                >
                  <option value="" disabled>Choose location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {loadingLocations && <p className="text-xs text-gray-500 mt-1">Loading locations…</p>}
                {locationsError && <p className="text-xs text-red-600 mt-1">{locationsError}</p>}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="status" name="status" className="sr-only peer" defaultChecked />
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

            {/* Error (form-level) */}
            {err && <p className="text-sm text-red-600">{err}</p>}

            {/* Footer ของ Modal ฟอร์ม */}
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={submitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                onClick={handleOpenAuth}
                disabled={submitting}
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
              >
                Add New
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal 2: Authentication ซ้อนทับ */}
      <AlertDialog open={openAuth} onOpenChange={(v) => setOpenAuth(v)}>
        {/* ไม่มี Trigger เพราะเปิดด้วย handleOpenAuth */}
        <AlertDialogContent
          className="!top-[42%] !-translate-y-[42%]"
          style={{ zIndex: 60 }} // ซ้อนทับ modal แรกให้แน่ใจ
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[var(--color-primary)]">
              Authentication Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm your identity to create this camera.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* user info */}
          <div className="mt-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div>
              {loading ? (
                <p className="text-sm text-gray-500">Loading user…</p>
              ) : me ? (
                <>
                  <p className="font-medium">{(me as any).usr_username ?? "User"}</p>
                  <p className="text-sm text-gray-500">{(me as any).usr_email ?? ""}</p>
                </>
              ) : (
                <p className="text-red-500">{meError || "Not logged in"}</p>
              )}
            </div>
          </div>

          {/* password input */}
          <div className="mt-3">
            <label className="text-sm font-medium" htmlFor="authPassword">Password</label>
            <input
              id="authPassword"
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 sm:h-[36px]"
              autoFocus
            />
          </div>

          {/* Error (auth-level) */}
          {authErr && <p className="text-sm text-red-600 mt-2">{authErr}</p>}

          <AlertDialogFooter>
            {/* ปุ่มย้อนกลับไปแก้ไขฟอร์ม */}
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => setOpenAuth(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Back to Edit
            </AlertDialogCancel>

            {/* ปุ่มยืนยันและสร้าง */}
            <Button
              onClick={handleConfirmCreate}
              disabled={submitting || !authPassword}
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Confirm & Create"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}