"use client";
import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "@/app/models/cameras.model";

/* ✅ ใช้ shadcn Select เพื่อให้สไตล์เดียวกัน */
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

/* ✅ ไอคอน lucide แบบไดนามิก */
import * as Lucide from "lucide-react";

type Props = {
    camera: Camera;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type EventItem = { id: number; name: string; icon?: string };

type AlertForm = {
    severity: "Critical" | "High" | "Medium" | "Low";
    eventId: string;
    description: string;
};

export default function EditCameraModal({ camera, open, setOpen }: Props) {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [form, setForm] = useState<AlertForm>({
        severity: "High",
        eventId: "",
        description: "",
    });

    // ช่วย normalize ชื่อไอคอน lucide
    function normalizeIconName(name?: string) {
        if (!name || typeof name !== "string") return undefined;
        const cleaned = name
            .replace(/[-_ ]+(\w)/g, (_, c) => (c ? c.toUpperCase() : ""))
            .replace(/^[a-z]/, (c) => c.toUpperCase());
        const alias: Record<string, string> = {
            TriangleAlert: "AlertTriangle",
            Alert: "AlertCircle",
            Cam: "Camera",
        };
        return alias[cleaned] ?? cleaned;
    }

    useEffect(() => {
        if (!open) return;
        setLoadingEvents(true);
        setErrMsg(null);

        fetch("/api/events")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: any[]) => {
                const normalized: EventItem[] = (Array.isArray(data) ? data : [])
                    .map((e: any) => ({
                        id: e?.id ?? e?.evt_id ?? e?.event_id,
                        name: e?.name ?? e?.evt_name ?? e?.event_name,
                        icon: e?.icon ?? e?.evt_icon ?? e?.event_icon,
                    }))
                    .filter((x: EventItem) => Number.isFinite(x.id) && !!x.name);

                const uniq = [...new Map(normalized.map((v) => [v.id, v])).values()];
                setEvents(uniq);
            })
            .catch((err) => {
                console.error("Load events failed:", err);
                setErrMsg("Cannot load events.");
            })
            .finally(() => setLoadingEvents(false));
    }, [open]);

    const camCode = `CAM${String(camera.id).padStart(3, "0")}`;

    function onChange<K extends keyof AlertForm>(key: K, value: AlertForm[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrMsg(null);

        if (!form.eventId) {
            setErrMsg("Please choose an event.");
            return;
        }

        const payload = {
            severity: form.severity,
            camera_id: Number(camera.id),
            footage_id: 1,
            event_id: Number(form.eventId),
            description: form.description?.trim() ?? "",
        };

        try {
            const res = await fetch(`/api/alerts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || `Create alert failed (${res.status})`);
            }

            setOpen(false);
            window.location.href = "/alerts";
        } catch (err: any) {
            console.error(err);
            setErrMsg(err.message || "Create alert failed.");
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[var(--color-primary)]">
                        New Alert — {camera?.name} ({camCode})
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Linking to #{camCode}. Set severity, category, and note, then Save.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Readonly camera info */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Camera Name</label>
                            <input
                                value={camera?.name ?? ""}
                                className="font-light w-full rounded-md border px-3 py-2 outline-none border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                                disabled
                            />
                        </div>
                        <div className="grid gap-1">
                            <label className="text-sm font-medium">Location</label>
                            <input
                                value={(camera as any)?.location?.name ?? ""}
                                className="font-light w-full rounded-md border px-3 py-2 outline-none border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-bg)]"
                                disabled
                            />
                        </div>
                    </div>

                    {/* ✅ Severity ใช้ shadcn Select (สไตล์เดียวกับ Event Type) */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-1">
                            <label className="text-sm font-medium" htmlFor="severity">
                                Severity
                            </label>
                            <Select
                                value={form.severity}
                                onValueChange={(val) =>
                                    onChange("severity", val as AlertForm["severity"])
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose Severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ✅ Event Type + ไอคอนสี var(--color-primary) */}
                        <div className="grid col-span-2 gap-1">
                            <label className="text-sm font-medium" htmlFor="event">
                                Event Type
                            </label>
                            <Select
                                value={form.eventId}
                                onValueChange={(val) => onChange("eventId", val)}
                            >
                                <SelectTrigger className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                    <SelectValue placeholder={loadingEvents ? "Loading..." : "Choose Event Type"} />
                                </SelectTrigger>

                                <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-64">
                                    {loadingEvents ? (
                                        <SelectItem value="__loading" disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : events.length === 0 ? (
                                        <SelectItem value="__empty" disabled>
                                            No events
                                        </SelectItem>
                                    ) : (
                                        events.map((evt) => {
                                            const iconName = normalizeIconName(evt.icon);
                                            // @ts-ignore
                                            const IconComp = (iconName && (Lucide as any)[iconName]) || Lucide.Dot;
                                            return (
                                                <SelectItem key={evt.id} value={String(evt.id)} textValue={evt.name}>
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <IconComp className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                                                        <span className="truncate" title={evt.name}>{evt.name}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid gap-1">
                        <label className="text-sm font-medium" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Enter your description"
                            className="font-light w-full rounded-md border px-3 py-3 outline-none focus-within:ring focus-within:ring-[var(--color-primary)]"
                            value={form.description}
                            onChange={(e) => onChange("description", e.target.value)}
                        />
                    </div>

                    {errMsg && <div className="text-sm text-red-600 mt-2">{errMsg}</div>}

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            type="submit"
                            disabled={!form.eventId}
                            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
                        >
                            Save
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}