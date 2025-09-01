"use client";
import { useState, useMemo } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle2, XCircle, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

const SEVERITY_STYLES = {
    critical: { pill: "bg-rose-50 text-rose-700 ring-rose-200", Icon: Icons.TriangleAlert },
    high: { pill: "bg-orange-50 text-orange-700 ring-orange-200", Icon: Icons.CircleAlert },
    medium: { pill: "bg-yellow-50 text-yellow-700 ring-yellow-200", Icon: Icons.Minus },
    low: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: Icons.ArrowDown },
    default: { pill: "bg-slate-50 text-slate-700 ring-slate-200", Icon: Icons.CircleAlert },
} as const;

function SeverityBadge({ value }: { value?: string }) {
    const key = (value ?? "").trim().toLowerCase() as keyof typeof SEVERITY_STYLES;
    const { pill, Icon } = SEVERITY_STYLES[key] ?? SEVERITY_STYLES.default;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="capitalize">{value ?? "Unknown"}</span>
        </span>
    );
}

const STATUS_STYLES = {
    active:       "bg-emerald-50 text-emerald-700 ring-emerald-200",
    resolved:     "bg-sky-50 text-sky-700 ring-sky-200",
    dismissed:    "bg-rose-50 text-rose-700 ring-rose-200",
    // pending:      "bg-amber-50 text-amber-700 ring-amber-200",
    // acknowledged: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    // inactive:     "bg-slate-100 text-slate-700 ring-slate-300",
    default:      "bg-slate-50 text-slate-700 ring-slate-200",
  } as const;
  
  function StatusBadge({ value }: { value?: string }) {
    const key = (value ?? "").trim().toLowerCase() as keyof typeof STATUS_STYLES;
    const pill = STATUS_STYLES[key] ?? STATUS_STYLES.default;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
        <span className="capitalize">{value ?? "Unknown"}</span>
      </span>
    );
  }

export type Alert = {
    id: number;
    severity: string;
    create_date: string;
    create_time: string;
    camera: { name: string; location: { name: string } };
    event: { name: string; icon?: string };
    status: string;
};

// helper: รับชื่อไอคอน (kebab-case) -> คืน Lucide component (PascalCase)
function iconFromName(name?: string) {
    if (!name) return Icons.Bell;
    const pascal = name
        .toString()
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    return ((Icons as any)[pascal] ?? Icons.Bell) as React.ComponentType<LucideProps>;
}

type Props = { alerts: Alert[] };

type SortKey = keyof Alert | "timestamp";
type SortOrder = "asc" | "desc" | null;

export default function AlertTable({ alerts }: Props) {
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>(null);

    const handleSort = (key: SortKey) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortOrder("asc");
        } else {
            if (sortOrder === "asc") setSortOrder("desc");
            else if (sortOrder === "desc") setSortOrder(null);
            else setSortOrder("asc");
        }
    };

    const sortedAlerts = useMemo(() => {
        if (!sortKey || !sortOrder) return alerts;

        return [...alerts].sort((a, b) => {
            let valA: any;
            let valB: any;

            if (sortKey === "timestamp") {
                valA = new Date(`${a.create_date} ${a.create_time}`).getTime();
                valB = new Date(`${b.create_date} ${b.create_time}`).getTime();
            } else {
                valA = a[sortKey];
                valB = b[sortKey];
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [alerts, sortKey, sortOrder]);

    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
        if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
        if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
    };

    if (!alerts?.length) {
        return (
            <div className="text-sm text-gray-500">
                No alerts to display.
            </div>
        );
    }

    return (
        <Table className="table-auto w-full">
            <TableHeader>
                <TableRow className="border-b border-[var(--color-primary)]">
                    <TableHead onClick={() => handleSort("severity")} className="cursor-pointer select-none text-[var(--color-primary)]">
                        <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                            <span>Severity</span>
                            {renderSortIcon("severity")}
                        </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort("id")} className="cursor-pointer select-none text-[var(--color-primary)]">
                        <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                            <span>Alert ID</span>
                            {renderSortIcon("id")}
                        </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort("timestamp")} className="cursor-pointer select-none text-[var(--color-primary)]">
                        <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                            <span>Timestamp</span>
                            {renderSortIcon("timestamp")}
                        </div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)]">
                        <div className="border-r border-[var(--color-primary)]">Camera</div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)]">
                        <div className="border-r border-[var(--color-primary)]">Event Type</div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)]">
                        <div className="border-r border-[var(--color-primary)]">Location</div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)]">
                        <div className="border-r border-[var(--color-primary)]">Status</div>
                    </TableHead>
                    <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {sortedAlerts.map((alr) => {
                    const EventIcon = iconFromName(alr.event?.icon);
                    const alrCode = `ALT${String(alr.id).padStart(3, "0")}`;

                    return (
                        <TableRow key={alr.id}>
                            <TableCell>
                                <SeverityBadge value={alr.severity} />
                            </TableCell>

                            <TableCell>{alrCode}</TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Icons.Clock3 className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{alr.create_date} {alr.create_time}</span>
                                </div>
                            </TableCell>
                            {/* <TableCell>{alr.create_date} {alr.create_time}</TableCell> */}

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Icons.Camera className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{alr.camera.name}</span>
                                </div>
                            </TableCell>
                            {/* <TableCell>{alr.camera.name}</TableCell> */}

                            {/* Event Type + icon */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <EventIcon className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{alr.event.name}</span>
                                </div>
                            </TableCell>

                            {/* Location */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                                    <span>{alr.camera.location.name}</span>
                                </div>
                            </TableCell>

                            <TableCell>
                                <StatusBadge value={alr.status} />
                            </TableCell>

                            <TableCell className="flex gap-2">
                                {/* ปุ่ม View แสดงเสมอ */}
                                <button className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                    <span>View</span>
                                </button>

                                {/* แสดงปุ่ม Resolved / Dismiss เฉพาะเมื่อสถานะเป็น Active */}
                                {alr.status?.trim().toLowerCase() === "active" && (
                                    <>
                                        <button className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success)] hover:border-[var(--color-success)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2">
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                            <span>Resolve</span>
                                        </button>
                                        <button className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-sm bg-white border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:border-[var(--color-danger)] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2">
                                            <XCircle className="h-4 w-4" aria-hidden="true" />
                                            <span>Dismiss</span>
                                        </button>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}