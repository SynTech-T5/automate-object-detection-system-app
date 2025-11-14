'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/models/cameras.model";
import { ArrowLeft, Camera as CameraIcon, Settings, TriangleAlert, MoreVertical, Maximize2, Minimize2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import CreateAlertForm from "@/app/components/Forms/CreateAlertForm";
import WhepPlayer from "../../components/WhepPlayer";
import { MaintenanceTypeBadge } from "../Badges/BadgeMaintenanceType"
import BadgeCameraType from "../Badges/BadgeCameraType"
import BadgeError from "../Badges/BadgeError"
import EditCameraModal from "../Forms/EditCameraForm";

export default function FullScreenView({ camera }: { camera: Camera | Camera[] }) {
    const [currentCamera, setCurrentCamera] = useState<Camera>(() => Array.isArray(camera) ? camera[0] : camera);
    const [open, setOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const imageSrc = "/library-room.jpg";
    const camCode = `CAM${String(currentCamera.camera_id).padStart(3, "0")}`;

    // ด้านบนไฟล์ (ใกล้ ๆ useState อื่น ๆ)
    const [webrtcFailed, setWebrtcFailed] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const isOnline = !!currentCamera.camera_status;
    const isRtsp = (currentCamera.source_type || "").toLowerCase() === "rtsp";

    const [isFullscreen, setIsFullscreen] = useState(false);

    const enterFullscreen = useCallback(() => {
        const el = containerRef.current as any;
        if (!el) return;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }, []);

    const exitFullscreen = useCallback(() => {
        const d = document as any;
        if (document.exitFullscreen) document.exitFullscreen();
        else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
        else if (d.msExitFullscreen) d.msExitFullscreen();
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement === containerRef.current) exitFullscreen();
        else enterFullscreen();
    }, [enterFullscreen, exitFullscreen]);

    useEffect(() => {
        const onChange = () => {
            setIsFullscreen(document.fullscreenElement === containerRef.current);
        };
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    // ถ้ากล้องเปลี่ยน ให้ reset สถานะ fail
    // (กันเคสกล้องก่อนหน้าล้มแล้วค้าง)
    useEffect(() => {
        setWebrtcFailed(false);
        setImageFailed(false);
    }, [currentCamera?.camera_id]);


    function onBack() {
        window.history.back();
    }

    const goEdit = () => {
        setOpen(true);
    };

    const goAlert = () => {
        setOpenAlert(true);
    };

    const handleCapture = useCallback(async () => {
        const box = containerRef.current;
        if (!box) return;

        const rect = box.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        const cs = getComputedStyle(box);
        const radius = parseFloat(cs.borderRadius || "0");

        ctx.save();
        roundRectPath(ctx, 0, 0, rect.width, rect.height, radius);
        ctx.clip();

        const v = videoRef.current;
        const im = imgRef.current;

        if (currentCamera.camera_status && v && v.readyState >= 2) {
            drawObjectCover(ctx, v, rect.width, rect.height);
        } else if (im && im.complete) {
            drawObjectCover(ctx, im, rect.width, rect.height);
        } else {
            ctx.restore();
            return;
        }

        ctx.restore();

        const ts = new Date();

        // ✅ แปลงเวลาให้อยู่ในโซน "Asia/Bangkok"
        const bangkokDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(ts);
        // จะได้ "2025-10-26, 14:45:32"
        const [datePart, timePart] = bangkokDate.split(", ");

        const safeLocation = (currentCamera.location_name || "Unknown")
            .replace(/\s+/g, "")      // ตัดช่องว่างทั้งหมด
            .replace(/[^A-Za-z0-9_-]/g, ""); // กันอักขระพิเศษที่ผิดกฎชื่อไฟล์
        const filename = `${safeLocation}_${camCode}_${datePart}_${timePart.replace(/:/g, "-")}.png`;

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }, "image/png", 0.92);
    }, [currentCamera.camera_status, camCode]);

    console.log(currentCamera.camera_id);
    console.log(currentCamera);

    return (
        <div className="grid gap-1">
            <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
                <label
                    htmlFor="cameraName"
                    className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
                >
                    {currentCamera.camera_name} ({camCode})
                </label>

                <div className="ml-auto flex gap-2">
                    <Button
                        type="button"
                        onClick={onBack}
                        className="shrink-0 bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]
                          px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </div>
            </div>

            <div className="relative overflow-hidden">
                {/* กรอบแสดงวิดีโอ/ภาพ */}
                <div
                    ref={containerRef}
                    className="
    relative w-full mx-auto mb-3 rounded-md bg-black
    [&>video]:absolute [&>video]:inset-0 [&>video]:w-full [&>video]:h-full
    [&>video]:object-cover [&>video]:rounded-md
  "
                    style={{
                        // สูงพอดีจอ laptop ไม่ต้องเลื่อน (เผื่อ header/toolbar ~220px)
                        height: "min(calc(100vh - 220px), calc((100vw - 48px) * 9 / 16))",
                        maxHeight: "calc(100vh - 220px)",
                        maxWidth: "min(100%, 1600px)",
                    }}
                >
                    {/* ปุ่ม Fullscreen มุมขวาบน */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="
      absolute right-2 top-2 z-20 inline-flex items-center gap-1
      rounded-md border border-white/20 bg-black/40 px-2 py-1 text-white
      backdrop-blur hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/40
    "
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
                    </button>

                    {isOnline && isRtsp && !webrtcFailed ? (
                        <WhepPlayer
                            key={currentCamera.camera_id}
                            ref={videoRef} // forwardRef ของ <video>
                            camAddressRtsp={currentCamera.source_value}
                            webrtcBase={process.env.NEXT_PUBLIC_WHEP_BASE ?? "http://localhost:8889"}
                            onFailure={() => setWebrtcFailed(true)}
                        />
                    ) : isOnline ? (
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt={currentCamera.camera_name}
                            className="absolute inset-0 h-full w-full object-cover rounded-md"
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <img
                            ref={imgRef}
                            src="/blind.svg"
                            alt="Camera offline"
                            className="absolute inset-0 h-full w-full object-cover rounded-md"
                        />
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-start gap-3 justify-center my-3">
                    <div
                        className="
                            sticky top-1 z-20 mb-3 rounded-xl border
                            border-[var(--color-primary-bg)] bg-white/70 backdrop-blur
                            px-3 py-2
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-[var(--color-primary)]">
                                    Camera Controls
                                </div>
                                <div className="text-xs text-gray-500">
                                    Quick tools for this camera
                                </div>
                            </div>

                            {/* Desktop toolbar */}
                            <div className="hidden sm:flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                onClick={handleCapture}
                                                className="shrink-0 bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]
                                                  px-3 py-2 rounded-md flex items-center gap-2"
                                            >
                                                <CameraIcon className="w-4 h-4" />
                                                <span>Snapshot</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Capture current frame</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                onClick={goEdit}
                                                className="shrink-0 bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]
                                                  px-3 py-2 rounded-md flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Settings camera</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                onClick={goAlert}
                                                className="shrink-0 bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hard)]
                                                  px-3 py-2 rounded-md flex items-center gap-2"
                                            >
                                                <TriangleAlert className="w-4 h-4" />
                                                <span>Create Alert</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Raise a manual alert</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Mobile compact menu */}
                            <div className="sm:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-9 w-9 p-0 border border-[var(--color-primary-bg)]"
                                            aria-label="Open quick controls"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem onClick={handleCapture}>
                                            <CameraIcon className="mr-2 h-4 w-4" />
                                            <span>Snapshot</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={goEdit}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={goAlert}
                                            className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
                                        >
                                            <TriangleAlert className="mr-2 h-4 w-4" />
                                            <span>Create Alert</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                        </div>
                    </div>
                </div>

                <Separator className="bg-[var(--color-primary-bg)] my-3" />

                {/* Camera Info */}
                <label className="col-span-3 text-lg text-[var(--color-primary)]">
                    Camera Information
                </label>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Location</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Last Maintenance</TableHead>
                            {currentCamera.camera_status ? "" : (
                                <TableHead>Cause</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{currentCamera.location_name}</TableCell>
                            <TableCell>
                                <BadgeCameraType type={currentCamera.camera_type} />
                            </TableCell>
                            <TableCell>
                                <MaintenanceTypeBadge name={currentCamera.maintenance_type} date={currentCamera.date_last_maintenance} />
                            </TableCell>
                            {currentCamera.camera_status ? "" : (
                                <TableCell>
                                    <BadgeError reason="Connection Timeout" />
                                    {/* <BadgeError reason="Unknown" />
                                    <BadgeError reason="Critical Failure" />
                                    <BadgeError reason="Server Down" />
                                    <BadgeError reason="Power Failure" />
                                    <BadgeError reason="Network Error" /> */}
                                </TableCell>
                            )}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            <CreateAlertForm camera={currentCamera} open={openAlert} setOpen={setOpenAlert} />
            <EditCameraModal camId={currentCamera.camera_id} open={open} setOpen={setOpen} />
        </div>
    );
}

/* ==================== Utilities ==================== */
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function drawObjectCover(ctx: CanvasRenderingContext2D, source: HTMLVideoElement | HTMLImageElement, destW: number, destH: number) {
    const isVideo = (s: any): s is HTMLVideoElement => "videoWidth" in s;
    const sW = isVideo(source) ? source.videoWidth : (source as HTMLImageElement).naturalWidth;
    const sH = isVideo(source) ? source.videoHeight : (source as HTMLImageElement).naturalHeight;
    if (!sW || !sH) return;

    const scale = Math.max(destW / sW, destH / sH);
    const cropW = destW / scale;
    const cropH = destH / scale;
    const sx = (sW - cropW) / 2;
    const sy = (sH - cropH) / 2;
    ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, destW, destH);
}