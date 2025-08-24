"use client";
import { useState, useMemo } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle2, XCircle, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

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
                    <TableHead onClick={() => handleSort("severity")} className="cursor-pointer select-none ]">
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
                    return (
                        <TableRow key={alr.id}>
                            <TableCell>{alr.severity}</TableCell>
                            <TableCell>{alr.id}</TableCell>
                            <TableCell>{alr.create_date} {alr.create_time}</TableCell>
                            <TableCell>{alr.camera.name}</TableCell>

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

                            <TableCell>{alr.status}</TableCell>

                            <TableCell className="flex gap-2">
                                <button className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-1 rounded-sm hover:opacity-90">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                    <span>View</span>
                                </button>
                                <button className="inline-flex items-center gap-2 bg-[var(--color-success)] text-white px-4 py-1 rounded-sm hover:opacity-90">
                                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                    <span>Resolved</span>
                                </button>
                                <button className="inline-flex items-center gap-2 bg-[var(--color-danger)] text-white px-4 py-1 rounded-sm hover:opacity-90">
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