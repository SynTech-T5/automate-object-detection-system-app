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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/models/cameras.model";
import { ArrowLeft } from "lucide-react"
import Performance from "@/app/components/Cameras/Details/Performance";
import Maintenance from "@/app/components/Cameras/Details/MaintenanceHistoryTable";
import EventDetection from "@/app/components/Cameras/Details/EventDetection";
import AccessControl from "@/app/components/Cameras/Details/CameraAccess";

export default function CameraDetails({ camera }: { camera: Camera }) {
    
    const [currentCamera, setCurrentCamera] = useState(camera);

    const imageSrc = "/library-room.jpg";
    const videoSrc = "/footage-library-room.mp4";

    const camCode = `CAM${String(currentCamera.camera_id).padStart(3, "0")}`;

    function onBack() {
        window.history.back();
    }

    return (
        <div className="w-full w-auto">
            <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
                <label
                    htmlFor="cameraDetails"
                    className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)] truncate"
                    title={`Camera Details : ${camCode}`}
                >
                    Camera Details : {camCode}
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
                    <span className="hidden sm:inline">Back</span>
                </Button>

                {/* Tabs */}
                <Tabs defaultValue="performance" className="w-full">
                    {/* เส้นขอบยาวเต็มความกว้าง (อยู่นอก TabsList) */}
                    {/* ตัวสกรอลของแถบเมนู */}
                    <div className="overflow-x-auto scrollbar-hide ios-smooth snap-x snap-mandatory scroll-gutter">
                        <div className="w-full relative -mx-5 px-5 border-b border-gray-200">
                            <TabsList
                                className="
                            inline-flex w-auto bg-transparent p-0 rounded-none
                            text-base whitespace-nowrap flex-nowrap
                            "
                            >
                                {[
                                    { id: "performance", label: "Performance" },
                                    { id: "event", label: "Event Detection" },
                                    { id: "access", label: "Access Control" },
                                    { id: "maint", label: "Maintenance" },
                                ].map((t) => (
                                    <TabsTrigger
                                        key={t.id}
                                        value={t.id}
                                        className="
                                    relative mr-6 h-9 px-0 bg-transparent rounded-none
                                    font-medium flex-shrink-0 snap-start
                                    text-gray-500 data-[state=active]:text-[var(--color-primary)]
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
                        </div>
                    </div>

                    <TabsContent value="performance" className="px-4 py-2">
                        <Performance camera={currentCamera} />
                    </TabsContent>
                    <TabsContent value="event" className="px-4 py-2">
                        <EventDetection camera={currentCamera} />
                    </TabsContent>
                    <TabsContent value="access" className="px-4 py-2">
                        <AccessControl camera={currentCamera} />
                    </TabsContent>
                    <TabsContent value="maint" className="px-4 py-2">
                        <Maintenance camera={currentCamera} />
                    </TabsContent>
                </Tabs>

            </div>
        </div>
    );
}