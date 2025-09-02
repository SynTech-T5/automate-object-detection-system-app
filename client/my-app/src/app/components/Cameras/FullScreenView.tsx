'use client';

import { useState, useRef, useCallback } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/Models/cameras.model";
import { ArrowLeft, Camera as CameraIcon, Settings, TriangleAlert, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import CreateAlertForm from "@/app/components/Forms/CreateAlertForm";
import { SuccessModal } from "@/app/components/Utilities/AlertsPopup";
import WhepPlayer from "../../components/WhepPlayer";

export default function FullScreenView({ camera }: { camera: Camera }) {
    const [currentCamera, setCurrentCamera] = useState(camera);
    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const imageSrc = "/library-room.jpg";
    const camCode = `CAM${String(currentCamera.id).padStart(3, "0")}`;

    function onBack() {
        window.history.back();
    }

    const goEdit = () => {
        setOpen(true);
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

        if (currentCamera.status && v && v.readyState >= 2) {
            drawObjectCover(ctx, v, rect.width, rect.height);
        } else if (im && im.complete) {
            drawObjectCover(ctx, im, rect.width, rect.height);
        } else {
            ctx.restore();
            return;
        }

        ctx.restore();

        const ts = new Date();
        const stamp = ts.toISOString().replace(/[:.]/g, "-");
        const filename = `${camCode}_${stamp}.png`;

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
    }, [currentCamera.status, camCode]);

    return (
        <div className="grid gap-1">
            <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
                <label
                    htmlFor="cameraName"
                    className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
                >
                    {currentCamera.name} ({camCode})
                </label>

                <div className="ml-auto flex gap-2">
                    <Button
                        type="button"
                        onClick={onBack}
                        className="shrink-0 bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]
                          px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Exit Fullscreen</span>
                    </Button>
                </div>
            </div>

            <div className="relative overflow-hidden">
                {/* กรอบแสดงวิดีโอ/ภาพ */}
                <div
                    ref={containerRef}
                    className="relative aspect-video mb-3 rounded-md"
                >
                    {currentCamera.status ? (
                        <WhepPlayer
                            ref={videoRef}   // ✅ forwardRef จาก WhepPlayer
                            camAddressRtsp={currentCamera.address}
                            webrtcBase={process.env.NEXT_PUBLIC_WHEP_BASE ?? "http://localhost:8889"}
                            onFailure={() => console.error("WHEP connection failed")}
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
                                                disabled
                                                className="shrink-0 bg-white text-[var(--color-primary)] border
                                                  border-[var(--color-primary-bg)] hover:bg-[var(--color-primary-bg)]
                                                  px-3 py-2 rounded-md flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Settings</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">Configure camera (coming soon)</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                onClick={goEdit}
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
                                        <DropdownMenuItem disabled>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={goEdit}
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

            <CreateAlertForm camera={currentCamera} open={open} setOpen={setOpen} />
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