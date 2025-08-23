'use client';
import { useState, useEffect } from "react";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Alert {
    severity: string;
    camera_id: number;
    footage_id: number | null;
    event_id: number;
    description: string;
}

interface Event {
    id: number;
    icon: string;
    name: string;
}

const base = process.env.NEXT_PUBLIC_APP_URL!;

async function fetchEvents(): Promise<Event[]> {
    const res = await fetch(`/api/events/`, { cache: "no-store" });
    if (!res.ok) {
        throw new Error("Failed to load events");
    }
    return res.json();
}

export default function Page() {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string>("");
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState("");

    async function postAlert(payload: Alert): Promise<Alert> {
        const res = await fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
            credentials: "include",
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to create alert");
        }
        return res.json();
    }

    useEffect(() => {
        fetchEvents()
            .then((data) => {
                setEvents(data);
                if (data.length > 0) setSelectedEvent(data[0].name); // set default
            })
            .catch((err) => console.error(err));
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr("");
        setSubmitting(true);

        const form = e.currentTarget as typeof e.currentTarget & {
            severity: { value: string };
            camera: { value: string };
            eventType: { value: string };
            description: { value: string };
        };

        try {
            const selected = events.find(
                (evt) => evt.name === form.eventType.value
            );
            if (!selected) {
                throw new Error("Invalid event selected");
            }

            await postAlert({
                severity: form.severity.value,
                camera_id: Number(form.camera.value),
                footage_id: null,
                event_id: selected.id,
                description: form.description.value,
            });

            setOpen(false);
            window.location.href = "/cameras";
        } catch (e: any) {
            setErr(e.message ?? "Submit failed");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <h1>Form Template</h1>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-[#0077FF] text-white hover:bg-[#0063d6]"
                    >
                        Create Alert
                    </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
                    <form id="userForm" onSubmit={onSubmit} className="space-y-4">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-[var(--color-primary)]">
                                Create New Alert
                            </AlertDialogTitle>
                        </AlertDialogHeader>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                                <label className="text-sm font-medium" htmlFor="camera">
                                    Camera
                                </label>
                                <input
                                    id="camera"
                                    name="camera"
                                    required
                                    placeholder="Camera"
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                                    disabled
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-medium" htmlFor="location">
                                    Location
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    required
                                    placeholder="Location"
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                                    disabled
                                />
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-medium" htmlFor="severity">
                                    Severity
                                </label>
                                <select
                                    id="severity"
                                    name="severity"
                                    defaultValue="High"
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                                >
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div className="grid gap-1">
                                <label className="text-sm font-medium" htmlFor="eventType">
                                    Event Type
                                </label>
                                <select
                                    id="eventType"
                                    name="eventType"
                                    value={selectedEvent}
                                    onChange={(e) => setSelectedEvent(e.target.value)}
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                                >
                                    {events.map((evt) => (
                                        <option key={evt.id} value={evt.name}>
                                            {evt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-1 col-span-2">
                                <label className="text-sm font-medium" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter alert description"
                                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                                ></textarea>
                            </div>

                            {err && <p className="text-sm text-red-600">{err}</p>}
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={submitting}
                                className="border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </AlertDialogCancel>

                            <Button
                                type="submit"
                                form="userForm"
                                disabled={submitting}
                                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
                            >
                                Add New
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
