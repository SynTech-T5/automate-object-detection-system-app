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

    const imageSrc = "/library-room.jpg";
    const videoSrc = "/footage-library-room.mp4";

    function onBack() {
        window.history.back();
    }

    return (
        <div className="grid gap-1">
            <div className="grid gap-1">
                <div className="grid grid-cols-2 mb-3">
                    <label htmlFor="cameraName" className="font-bold text-xl text-[var(--color-primary)]">Camera name: {currentCamera.name}</label>
                    <Button
                        type="submit"
                        onClick={onBack}
                        className="justify-self-end bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        <ArrowLeft className="w-4 h-4" /> 
                        Exit Fullscreen
                    </Button>
                </div>
                <div className="relative overflow-hidden rounded-md">
                    <div className="relative aspect-video">
                        <video
                            src={videoSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls={false}
                            preload="metadata"
                            poster={imageSrc}
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
                        />
                    </div>
                </div>

                <div className="">
                    <label htmlFor="camerainfo" className="col-span-3 text-xl text-[var(--color-primary)]">Camera Information</label>
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
                                <TableCell>{currentCamera.installation_date} {currentCamera.installation_time}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}