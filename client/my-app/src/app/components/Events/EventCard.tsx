"use client";
import { MoreVertical } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { EventItem, EventSensitivity } from "./types";

export function EventCard({
    item,
    onToggle,
    onEdit,
    onDelete,
    className,
    disabled,
}: {
    item: EventItem;
    onToggle?: (id: EventItem["id"], next: boolean) => void;
    onEdit?: (item: EventItem) => void;
    onDelete?: (item: EventItem) => void;
    className?: string;
    disabled?: boolean;
}) {
    const normalizeIconName = (name?: string) => {
        if (!name) return undefined;
        if ((LucideIcons as any)[name]) return name;
        const fixed = name.charAt(0).toUpperCase() + name.slice(1);
        if ((LucideIcons as any)[fixed]) return fixed;
        return undefined;
    };

    const iconName = normalizeIconName(item.icon);
    const IconComp = iconName && (LucideIcons as any)[iconName]
        ? (LucideIcons as any)[iconName]
        : (LucideIcons as any).ShieldAlert;

    const switchId = `enable-${item.id}`;

    return (
        // ใส่ group ตรง wrapper เพื่อให้ group-hover ทำงานกับ tab ด้านบน
        <div className="relative mt-10 group">
            {/* Top tab background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-8 h-16 rounded-2xl
                   bg-[#0B63FF]/10 shadow-sm z-0
                   transition-colors group-hover:bg-[#0B63FF]/20 group-hover:shadow-md border-2 border-[#0B63FF]/40"
            />

            {/* Floating icon */}
            <div className="absolute left-6 -top-6 z-20">
                <div className="grid place-items-center h-12 w-12 rounded-full bg-white ring-2 ring-[#0B63FF]/30 shadow">
                    <div className="grid place-items-center h-10 w-10 rounded-full bg-[#0B63FF] text-white">
                        <IconComp className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <Card
                className={cn(
                    "relative z-10 flex flex-col rounded-2xl border-2 border-[#0B63FF]/40 bg-white shadow-sm",
                    // card hover และ group-hover (เพื่อให้ tab เปลี่ยนพร้อมกันเมื่อ hover ที่ card)
                    "transition-colors hover:border-[#0B63FF] group-hover:border-[#0B63FF] p-6",
                    className
                )}
            >
                <CardContent className="p-0 w-full">
                    {/* Header row: title/desc left, action right */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold tracking-tight text-[#0B63FF] truncate">
                                {item.name}
                            </h3>
                            {item.description && (
                                <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0B63FF] transition hover:bg-[#0B63FF]/10 focus:outline-none"
                                    aria-label="Open menu"
                                >
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => onEdit?.(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete?.(item)}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Controls: label left, action right */}
                    <div className="mt-2 grid gap-4">
                        {/* Switch row */}
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-sm font-medium" htmlFor={switchId}>
                                Enable Detection
                            </label>
                            <label className={cn("inline-flex items-center cursor-pointer", disabled && "cursor-not-allowed opacity-60")}>
                                <input
                                    type="checkbox"
                                    id={switchId}
                                    name="enable"
                                    className="sr-only peer"
                                    checked={!!item.status}
                                    onChange={(e) => onToggle?.(item.id, e.target.checked)}
                                    disabled={disabled}
                                />
                                <div
                                    className={cn(
                                        "relative w-14 h-8 rounded-full bg-gray-300 transition-colors duration-200",
                                        "peer-checked:bg-[color:var(--color-primary)]",
                                        disabled && "!bg-gray-200",
                                        "after:content-[''] after:absolute after:top-1 after:left-1 after:w-6 after:h-6 after:bg-white after:rounded-full after:shadow after:transition-all after:duration-200 peer-checked:after:translate-x-6"
                                    )}
                                />
                            </label>
                        </div>

                        {/* Sensitivity row */}
                        <div className="flex items-center justify-between gap-4">
                            <label className="text-sm font-medium">
                                Sensitivity
                            </label>
                            <Select
                                value={item.sensitivity ?? "Medium"}
                                onValueChange={(v: EventSensitivity) => onEdit?.({ ...item, sensitivity: v })}
                                disabled={disabled}
                            >
                                <SelectTrigger
                                    className="w-36 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)]
                             focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-2 py-1.5 text-xs sm:text-sm"
                                >
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="border-[var(--color-primary)]">
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}