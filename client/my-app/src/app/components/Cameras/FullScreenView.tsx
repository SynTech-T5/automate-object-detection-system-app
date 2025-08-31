'use client';

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/models/cameras.model";
import { ArrowLeft } from "lucide-react"

export default function FullScreenView({ camera }: { camera: Camera }) {

    const [currentCamera, setCurrentCamera] = useState(camera);

    // กำหนด base URL ไว้ตรงนี้
    const streamBaseURL = "http://localhost:8066/api/cameras/stream/";
    // address ที่ frontend ใช้จริง
    const streamAddress = `${streamBaseURL}${camera.id}`;

    const imageSrc = "/library-room.jpg";




    const camCode = `CAM${String(currentCamera.id).padStart(3, "0")}`;

    function onBack() {
        window.history.back();
    }

    return (
        <div className="grid gap-1">
            <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
                <label
                    htmlFor="cameraName"
                    className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
                >
                    {currentCamera.name} ({camCode})
                </label>

                <Button
                    type="button"
                    onClick={onBack}
                    className="
                    ml-auto shrink-0
                    bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]
                    px-4 py-2 rounded-md disabled:opacity-50
                    flex items-center gap-2
                    "
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                </Button>
            </div>

            <div className="relative overflow-hidden">
                <div className="relative aspect-video mb-3">
                    {currentCamera.status ? (
                        <video
                            src={streamAddress}
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls={false}
                            preload="metadata"
                            poster={imageSrc}
                            className="absolute inset-0 h-full w-full object-cover rounded-md"
                            onError={(e) => {
                                (e.currentTarget as HTMLVideoElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <img
                            src="/blind.svg"
                            alt="Camera offline"
                            className="absolute inset-0 h-full w-full object-cover rounded-md"
                        />
                    )}
                </div>

                <label htmlFor="camerainfo" className="col-span-3 text-lg text-[var(--color-primary)]">Camera Information</label>
                <Table>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Location</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Health</TableHead>
                            <TableHead>Resolution</TableHead>
                            <TableHead>Last Maintenance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{currentCamera.location.name}</TableCell>
                            <TableCell>{currentCamera.address}</TableCell>
                            <TableCell>{currentCamera.type}</TableCell>
                            <TableCell>{currentCamera.health}</TableCell>
                            <TableCell>{currentCamera.resolution}</TableCell>
                            <TableCell>
                                {(() => {
                                    const date = currentCamera.last_maintenance_date as string | undefined;
                                    const time = currentCamera.last_maintenance_time as string | undefined;

                                    const combined = `${date ?? ""} ${time ?? ""}`.trim();

                                    // เป็น "-" ถ้าไม่มีค่า หรือเป็นค่า epoch placeholder: 1970-01-01 07:00:00
                                    const showDash =
                                        !combined ||
                                        combined === "1970-01-01 07:00:00" ||
                                        (date === "1970-01-01" && (!time || time.startsWith("07:00")));

                                    const label = showDash ? "-" : combined;

                                    return <span className="truncate max-w-[260px]">{label}</span>;
                                })()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}