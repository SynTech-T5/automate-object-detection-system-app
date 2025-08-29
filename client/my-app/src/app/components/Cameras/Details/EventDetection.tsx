"use client";

import * as React from "react";
import * as Lucide from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/* =============== Severity styles (no icons) =============== */
const SEVERITY_STYLES = {
    critical: { pill: "bg-rose-50 text-rose-700 ring-rose-200" },
    high: { pill: "bg-orange-50 text-orange-700 ring-orange-200" },
    medium: { pill: "bg-yellow-50 text-yellow-700 ring-yellow-200" },
    low: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    default: { pill: "bg-slate-50 text-slate-700 ring-slate-200" },
} as const;
type LevelKey = keyof typeof SEVERITY_STYLES;

/* ================== Types & Mock Data ================== */
type EventRow = {
    id: number | string;
    name: string;
    evt_icon?: string; // lucide icon name
    sensitivity: "Critical" | "High" | "Medium" | "Low";
    priority: "Critical" | "High" | "Medium" | "Low";
    status: boolean;
};

const MOCK_EVENTS: EventRow[] = [
    { id: 1, name: "Fighting / Physical Assault", evt_icon: "ShieldAlert", sensitivity: "Critical", priority: "High", status: true },
    { id: 2, name: "Person Falling Down", evt_icon: "Accessibility", sensitivity: "High", priority: "High", status: true },
    { id: 3, name: "Theft or Suspicious Behavior", evt_icon: "UserSearch", sensitivity: "Medium", priority: "High", status: true },
    { id: 4, name: "Unauthorized Access", evt_icon: "LockKeyhole", sensitivity: "High", priority: "Critical", status: true },
    { id: 5, name: "Fire or Smoke Detection", evt_icon: "Flame", sensitivity: "Critical", priority: "Critical", status: true },
    { id: 6, name: "Vehicle Accidents", evt_icon: "Car", sensitivity: "High", priority: "High", status: true },
    { id: 7, name: "Crowd Gathering", evt_icon: "Users", sensitivity: "Medium", priority: "Medium", status: false },
    { id: 8, name: "Loitering Detection", evt_icon: "PersonStanding", sensitivity: "Low", priority: "Low", status: true },
    { id: 9, name: "Abandoned Object Detection", evt_icon: "PackageOpen", sensitivity: "Medium", priority: "Medium", status: false },
    { id: 10, name: "Slip and Fall Detection", evt_icon: "Activity", sensitivity: "High", priority: "Medium", status: true },
];

const OPTIONS = ["Critical", "High", "Medium", "Low"] as const;

/* ================== Helpers ================== */
function LucideByName({ name, className }: { name?: string; className?: string }) {
    const Fallback = Lucide.CircleDot;
    if (!name) return <Fallback className={className} />;
    const Cmp = (Lucide as Record<string, any>)[name];
    return Cmp ? <Cmp className={className} /> : <Fallback className={className} />;
}

function levelKey(v: string): LevelKey {
    const k = v.toLowerCase() as LevelKey;
    return (SEVERITY_STYLES[k] ? k : "default") as LevelKey;
}

/* pill (text only, no icon) */
function SeverityPill({ value }: { value: EventRow["sensitivity" | "priority"] }) {
    const key = levelKey(value);
    const { pill } = SEVERITY_STYLES[key];
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${pill}`}>
            {value}
        </span>
    );
}

/* ================== Main ================== */
export default function EventDetectionTable() {
    const [events, setEvents] = React.useState<EventRow[]>(MOCK_EVENTS);

    const update = (id: EventRow["id"], field: keyof EventRow, value: any) => {
        setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev)));
    };

    return (
        <div className="w-full">
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur">
                    <TableRow>
                        <TableHead className="w-[46%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
                            Event
                        </TableHead>
                        <TableHead className="w-[18%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
                            Sensitivity
                        </TableHead>
                        <TableHead className="w-[18%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
                            Alert Priority
                        </TableHead>
                        <TableHead className="w-[18%] text-[var(--color-primary)] border-b border-[var(--color-primary)]">
                            Status
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {events.map((ev) => (
                        <TableRow key={ev.id} className="hover:bg-slate-50/60">
                            {/* Event */}
                            <TableCell>
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="shrink-0 grid place-items-center h-9 w-9 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
                                        <LucideByName name={ev.evt_icon} className="w-4 h-4 text-[var(--color-primary)]" />
                                    </span>
                                    <span className="text-sm text-slate-800 truncate">{ev.name}</span>
                                </div>
                            </TableCell>

                            {/* Sensitivity (borderless Select) */}
                            <TableCell>
                                <Select
                                    value={ev.sensitivity}
                                    onValueChange={(v) => update(ev.id, "sensitivity", v as EventRow["sensitivity"])}
                                >
                                    <SelectTrigger className="w-fit p-0 border-0 bg-transparent shadow-none focus:ring-0 focus:outline-none focus:border-0">
                                        <div className="py-1">
                                            <SelectValue placeholder="Select sensitivity">
                                                <SeverityPill value={ev.sensitivity} />
                                            </SelectValue>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[9rem]">
                                        {OPTIONS.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                <span className="block">
                                                    <SeverityPill value={opt} />
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>

                            {/* Priority (borderless Select) */}
                            <TableCell>
                                <Select
                                    value={ev.priority}
                                    onValueChange={(v) => update(ev.id, "priority", v as EventRow["priority"])}
                                >
                                    <SelectTrigger className="w-fit p-0 border-0 bg-transparent shadow-none focus:ring-0 focus:outline-none focus:border-0">
                                        <div className="py-1">
                                            <SelectValue placeholder="Select priority">
                                                <SeverityPill value={ev.priority} />
                                            </SelectValue>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="min-w-[9rem]">
                                        {OPTIONS.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                <span className="block">
                                                    <SeverityPill value={opt} />
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <div className="flex items-center">
                                    <Switch
                                        checked={ev.status}
                                        onCheckedChange={(v) => update(ev.id, "status", v)}
                                        className="[--track:theme(colors.slate.300)] data-[state=checked]:[--track:var(--color-primary)]"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">{ev.status ? "Enabled" : "Disabled"}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    {events.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-sm text-slate-500">
                                No events found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}