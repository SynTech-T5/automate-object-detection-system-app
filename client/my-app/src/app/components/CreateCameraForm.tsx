'use client';

import { useState } from "react";
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


interface cameraForm {
  cam_name: string;
  cam_address: string;
  cam_type: string;
  cam_resolution: string;
  cam_description: string;
  cam_status: boolean;
  cam_location_id: number;
}

export type createCamera = {
  name: string;
  address: string;
  type: string;
  resolution: string;
  description: string;
  status: boolean;
  location: {
    id: number;
    name: string;
  };
};

export default function Page({ datas }: { datas: createCamera[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string>("");

  const { me, loading, error: meError } = useMe();

  const locations = Array.from(
    new Map(
      datas.map(cam => [cam.location.id, cam.location])  // unique ด้วย id
    ).values()
  );

  const types = Array.from(
    new Set(datas.map(cam => cam.type))
  );


  async function createCamera(payload: cameraForm): Promise<cameraForm> {
    const res = await fetch("/api/cameras/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to Create");
    }
    return res.json();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    const form = e.currentTarget as typeof e.currentTarget & {
      name: { value: string };
      address: { value: string };
      type: { value: string };
      resolution: { value: string };
      status: { checked: boolean };
      description: { value: string };
      location: { value: string };
      password: { value: string };
    };

    try {
      // 1) ตรวจสอบรหัสผ่านก่อน
      const check = await fetch("/api/auth/recheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: form.password.value }),
      });

      if (!check.ok) {
        throw new Error("Password incorrect, please try again.");
      }

      // 2) ถ้าผ่าน → เพิ่มกล้อง
      await createCamera({
        cam_name: form.name.value,
        cam_address: form.address.value,
        cam_type: form.type.value,
        cam_resolution: form.resolution.value,
        cam_status: form.status.checked,
        cam_description: form.description.value,
        cam_location_id: parseInt(form.location.value, 10),
      });

      setOpen(false); // ปิดโมดัลเมื่อสำเร็จ
      window.location.href = "/cameras";
      
    } catch (e: any) {
      setErr(e.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="bg-[#0077FF] text-white hover:bg-[#0063d6] sm:w-[200px] h-[30px] w-full"
          >
            <Cctv size={16} />
            Add New Camera
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="!top-[40%] !-translate-y-[40%] max-w-lg">
          <form id="cameraForm" onSubmit={onSubmit} className="space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-600 font-semibold">
                Add New Camera
              </AlertDialogTitle>
            </AlertDialogHeader>

            <div className="grid grid-cols-2 gap-4">
              {/* Camera Name */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="name">
                  Camera Name<span className="text-blue-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter camera name"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 
                  sm:w-[220px] h-[30px] text-xs leading-[30px]"
                />
              </div>

              {/* IP Address */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="address">
                  IP Address<span className="text-blue-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  placeholder="IP"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 
                  sm:w-[220px] h-[30px] text-xs leading-[30px]"
                />
              </div>

              {/* Location */}
              <div className="grid gap-1">
                <label className="text-sm font-medium " htmlFor="location">
                  Location<span className="text-blue-500">*</span>
                </label>
                <select
                  id="location"
                  name="location"
                  required
                  defaultValue=""
                  className="w-full rounded-md border px-3 outline-none focus:ring focus:ring-blue-100 
                  sm:w-[220px] h-[30px] text-xs leading-[30px]"
                >
                  <option value="" disabled>
                    {`{location}`}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Type */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="type">
                  Camera Type<span className="text-blue-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue=""
                  className="w-full rounded-md border px-3  outline-none focus:ring focus:ring-blue-100 
                  sm:w-[220px] h-[30px] text-xs leading-[30px]"
                >
                  <option value="" disabled>
                    {`{camera_type}`}
                  </option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resolution */}
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="resolution">
                  Resolution<span className="text-blue-500">*</span>
                </label>
                <select
                  id="resolution"
                  name="resolution"
                  required
                  defaultValue=""
                  className="w-full rounded-md border px-3  outline-none focus:ring focus:ring-blue-100 
                  sm:w-[220px] h-[30px] text-xs leading-[30px]"
                >
                  <option value="" disabled>
                    {`{resolution}`}
                  </option>
                  <option value="720p">1280x720</option>
                  <option value="1080p">1920x1080</option>
                  <option value="4K">3840x2160</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 mt-6">
                <label className="text-sm font-medium">Status</label>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </label>
                <span className="text-sm">Active</span>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-1">
              <AlertDialogDescription asChild>
                <label className="text-sm font-medium " htmlFor="description">
                  Description
                </label>
              </AlertDialogDescription>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Enter camera description"
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 
                sm:w-[460px] h-[80px] text-xs leading-[30px]"
              />
            </div>

            {/* Authentication Section */}
            <div className="pt-2 border-t">
              <h3 className="text-blue-600 font-semibold">Require Authentication</h3>
              <div className="mt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    {loading ? (
                      <p className="text-sm text-gray-500">Loading user...</p>
                    ) : me ? (
                      <>
                        <p className="font-medium">{me.usr_username}</p>
                        <p className="text-sm text-gray-500">{me.usr_email}</p>
                      </>
                    ) : (
                      <p className="text-red-500">Not logged in</p>
                    )}
                  </div>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 
                  sm:w-[460px] h-[30px] text-xs leading-[30px]"
                />
              </div>
            </div>

            {/* Error */}
            {err && <p className="text-sm text-red-600">{err}</p>}

            {/* Footer */}
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={submitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                form="cameraForm"
                disabled={submitting}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Add New"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}