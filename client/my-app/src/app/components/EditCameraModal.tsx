"use client";
import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { error } from "console";

type Props = {
    camId: number;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type LocationItem = { id: number; name: string };

export default function EditCameraModal({ camId, open, setOpen }: Props) {
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [errMsg, setErrMsg] = useState<string | null>(null);


    const [form, setForm] = useState({
        cam_name: "",
        cam_address: "",
        cam_resolution: "",
        cam_type: "",
        cam_status: false,
        cam_location_id: "",
        cam_description: "",
    });

    // โหลดข้อมูลกล้องเมื่อ modal เปิด
    useEffect(() => {
        if (open) {
            fetch(`/api/cameras/${camId}`)
                .then((res) => res.json())
                .then((data) => {
                    setForm({
                        cam_name: data.name,
                        cam_address: data.address,
                        cam_resolution: data.resolution,
                        cam_type: data.type,
                        cam_status: data.status,
                        cam_location_id: String(data.location.id),
                        cam_description: data.description,
                    })
                });
        }
    }, [open, camId]);

    // โหลดข้อมูล Location เมื่อ modal เปิด
    useEffect(() => {
        if (open) {
            fetch("/api/cameras/location")
                .then((res) => res.json())
                .then((data: any[]) => {
                    setErrMsg("");
                    const normalized: LocationItem[] = (Array.isArray(data) ? data : [])
                        .map((l: any) => ({
                            id: l?.id ?? l?.loc_id ?? l?.location_id,
                            name: l?.name ?? l?.loc_name ?? l?.location_name ?? l?.location,
                        }))
                        .filter((x: LocationItem) => Number.isFinite(x.id) && !!x.name);

                    const uniq = [...new Map(normalized.map((v) => [v.id, v])).values()];
                    setLocations(uniq);
                })
                .catch((err) => {
                    console.error("Load locations failed:", err);
                });
        }

    }, [open]);



    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            ...form,
            cam_location_id: Number(form.cam_location_id),
        };
        // console.log("Submitting form...", payload);
        const res = await fetch(`/api/cameras/${camId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setErrMsg(data.message);
            return;
        }
        console.log("res.status", res.status);
        window.location.reload()
        setOpen(false); // ปิด modal หลังบันทึก
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Camera #{camId}</AlertDialogTitle>
                    <AlertDialogDescription>Fill in the details and click Save.</AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Camera Name */}
                    <div className="grid gap-1">
                        <label className="text-sm font-medium" htmlFor="name">
                            Camera Name
                        </label>
                        <input
                            name="cam_name"
                            value={form.cam_name}
                            onChange={handleChange}
                            className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                            required
                            placeholder="Enter your camera name"
                        />
                    </div>
                    {/* IP Address */}
                    <div className="grid gap-1">
                        <label className="text-sm font-medium" htmlFor="address">
                            IP Address
                        </label>
                        <input
                            name="cam_address"
                            value={form.cam_address}
                            onChange={handleChange}
                            className="font-light w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                            required
                            placeholder="Enter your IP Address"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Camera Type */}
                        <div className="grid gap-1">
                            <label className="text-sm font-medium" htmlFor="type">
                                Camera Type
                            </label>
                            <select
                                name="cam_type"
                                value={form.cam_type}
                                onChange={handleChange}
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
                                name="cam_resolution"
                                value={form.cam_resolution}
                                onChange={handleChange}
                                className="w-full rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                            >
                                <option value="480p">480p</option>
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                                <option value="4K">4K</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {/* Location */}
                        <div className="col-span-2">
                            <label className="text-sm font-medium" htmlFor="location">
                                Location
                            </label>
                            <select
                                name="cam_location_id"
                                value={form.cam_location_id}
                                onChange={handleChange}
                                className="w-full  rounded-md border px-3 py-2 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                            >
                                <option value="" disabled>Choose location</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Status */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium" htmlFor="status">
                                Status
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="cam_status"
                                    className="sr-only peer"
                                    checked={form.cam_status}
                                    onChange={e =>
                                        setForm({ ...form, cam_status: e.target.checked })
                                    }
                                />
                                <div
                                    className="relative w-14 h-7 rounded-full
                                        bg-gray-300 peer-checked:bg-[color:var(--color-primary)]
                                        transition-colors duration-200
                                        after:content-[''] after:absolute after:top-1 after:left-1
                                        after:w-5 after:h-5 after:bg-white after:rounded-full
                                        after:shadow after:transition-all after:duration-200
                                        peer-checked:after:translate-x-7"
                                ></div>
                            </label>
                        </div>
                    </div>
                    {/* Description */}
                    <div className="grid gap-1">
                        <label className="text-sm font-medium" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            name="cam_description"
                            placeholder="Enter your description"
                            className="font-light w-full rounded-md border px-3 py-3 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                            value={form.cam_description}
                            onChange={handleChange}
                        />
                    </div>

                    {errMsg && (
                        <div className="text-sm text-red-600 mt-2">
                            {errMsg}
                        </div>
                    )}

                    <AlertDialogFooter>
                        {/* ปุ่มยกเลิก */}
                        <AlertDialogCancel
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </AlertDialogCancel>

                        {/* ปุ่มยืนยัน */}
                        <Button
                            onClick={handleSubmit}
                            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
                        >
                            Save
                        </Button>

                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
