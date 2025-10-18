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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CameraForm {
  cam_name: string;
  cam_url: string;
  cam_type: string;
  cam_resolution: string;
  cam_description: string;
  cam_status: boolean;
  cam_location_id: number;
}

type LocationItem = { id: number; name: string };

export default function
  Page() {
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
  type ApiLocation = {
    location_id: number;
    location_name: string;
    location_updated_date: string;
    location_updated_time: string;
  };

  // แก้ชนิดของ state
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationsError, setLocationsError] = useState<string>("");

  useEffect(() => {
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

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // รูปแบบ: { message: string, data?: ApiLocation[] }
        const payload: { message: string; data?: ApiLocation[] } = await res.json();

        if (!mounted) return;

        const arr = Array.isArray(payload?.data) ? payload.data! : [];
        setLocations(arr);
      } catch (e: any) {
        if (!mounted) return;
        setLocations([]);
        setLocationsError(e?.message || "Failed to load locations");
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function createCamera(payload: CameraForm): Promise<CameraForm> {
    const res = await fetch("/api/cameras/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
        "Content-Type": "application/json",
      },
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
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          "Content-Type": "application/json",
        },
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
        cam_url: String(fd.get("url") ?? ""),
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
            Add Camera
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

            <div className="grid grid-cols-3 gap-2">
              {/* Camera Type */}
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-black" htmlFor="type">
                  Camera Type
                </Label>
                <Select defaultValue="Fixed" name="type">
                  <SelectTrigger
                    id="type"
                    className="w-full rounded-md border border-gray-300
                 bg-white text-sm text-black
                 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                 px-3 py-2"
                  >
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)] text-black">
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="PTZ">PTZ</SelectItem>
                    <SelectItem value="Panoramic">Panoramic</SelectItem>
                    <SelectItem value="Thermal">Thermal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Camera Name */}
              <div className="col-span-2 gap-1">
                <label className="text-sm font-medium" htmlFor="name">
                  Camera Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Max 32 characters"
                  className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Source Type */}
              <div className="grid gap-1">
                <Label className="text-sm font-medium text-black" htmlFor="type">
                  Source Type
                </Label>
                <Select defaultValue="url" name="source_type">
                  <SelectTrigger
                    id="source_type"
                    className="w-full rounded-md border border-gray-300
                 bg-white text-sm text-black
                 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                 px-3 py-2"
                  >
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--color-primary)] text-black">
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="address">IP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Value */}
              <div className="col-span-2 gap-1">
                <label className="text-sm font-medium" htmlFor="url">
                  Source Value
                </label>
                <input
                  id="url"
                  name="url"
                  placeholder="Enter camera source"
                  className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Location */}
              <div className="col-span-2 grid gap-1">
                <Label className="text-sm font-medium text-black" htmlFor="location">
                  Location
                </Label>

                <Select name="location" defaultValue="">
                  <SelectTrigger
                    id="location"
                    className="w-full rounded-md border border-gray-300
                 bg-white text-sm text-black
                 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                 px-3 py-2"
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
              <Button
                type="button"
                onClick={handleOpenAuth}
                disabled={submitting}
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
              >
                Add Camera
              </Button>
              <AlertDialogCancel
                disabled={submitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </AlertDialogCancel>
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