import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

/// เพิ่ม import ด้านบนไฟล์
import { Eye, CheckCircle2, XCircle, MapPin } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";


interface alert {
    id: number;
    severity: string;
    create_date: string;
    create_time: string;
    camera: {
        name: string;
        location: {
            name: string;
        }
    }
    event: {
        name: string;
        icon?: string;
    }

    status: string;
}

const base = process.env.NEXT_PUBLIC_APP_URL!;


// helper: รับชื่อไอคอน แล้วคืน Lucide component
function iconFromName(name?: string) {
  // ไม่มีชื่อ -> fallback เป็น Bell
  if (!name) return Icons.Bell;

  // แปลงเป็น PascalCase เช่น "check-circle-2" -> "CheckCircle2"
  const pascal = name
    .toString()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  // ถ้ามีคอมโพเนนต์ชื่อนั้น ให้ใช้เลย ไม่งั้น fallback เป็น Bell
  return ((Icons as any)[pascal] ?? Icons.Bell) as React.ComponentType<LucideProps>;
}


export default async function Page() {

    const res = await fetch(`${base}/api/alerts`, {
        cache: "no-store",
        method: "GET",
        credentials: "include",
    });

    const alerts: alert[] = await res.json();

    if (!res.ok) {
        throw new Error("Failed to load alerts");
    }

    return (
        <Table className="table-auto w-full">
            <TableHeader>
                <TableRow className="border-b border-[var(--color-primary)]">
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Severity
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Alert ID
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Timestamp
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Camera
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Event Type
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Location
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)] ">
                        <div className="border-r border-[var(--color-primary)]">
                            Status
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alerts.map((alr) => {
                    const EventIcon = iconFromName(alr.event?.icon);

                    return (
                        <TableRow key={alr.id}>
                            <TableCell>{alr.severity}</TableCell>
                            <TableCell>{alr.id}</TableCell>
                            <TableCell>{alr.create_date} {alr.create_time}</TableCell>
                            <TableCell>{alr.camera.name}</TableCell>

                            {/* Event Type + icon จาก alr.event.icon */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <EventIcon className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{alr.event.name}</span>
                                </div>
                            </TableCell>

                            {/* Location + ไอคอนเดียวกันหมด */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{alr.camera.location.name}</span>
                                </div>
                            </TableCell>

                            <TableCell>{alr.status}</TableCell>

                            <TableCell className="flex gap-2">
                                <button className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-1 rounded-sm transition-colors hover:opacity-90">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                    <span>View</span>
                                </button>
                                <button className="inline-flex items-center gap-2 bg-[var(--color-success)] text-white px-4 py-1 rounded-sm transition-colors hover:opacity-90">
                                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                    <span>Resolved</span>
                                </button>
                                <button className="inline-flex items-center gap-2 bg-[var(--color-danger)] text-white px-4 py-1 rounded-sm transition-colors hover:opacity-90">
                                    <XCircle className="h-4 w-4" aria-hidden="true" />
                                    <span>Dismiss</span>
                                </button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>

        </Table>
    );
}