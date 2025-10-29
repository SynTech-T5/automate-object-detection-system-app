// app/components/Alerts/RecentAlerts.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* ------------------------------- Types ----------------------------------- */
type ApiItem = {
    camera_id: number;
    camera_name: string;
    location_name: string;
    last_alert_id: number;
    last_alert_at: string;           // ISO
    last_alert_status: string;       // active | resolved | dismissed | ...
    last_alert_severity: string;     // critical | high | medium | low
    event_name: string;
    event_icon?: string;             // e.g. wifi-off
    footage_path?: string;           // image/video path
    active_alerts?: number;
};

/* ------------------------------ Utilities -------------------------------- */
function formatTime(iso: string) {
    try {
        const d = new Date(iso);
        return d
            .toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" })
            .replace("T", " ");
    } catch {
        return iso;
    }
}

function iconFromName(name?: string) {
    if (!name) return Icons.Bell;
    const pascal = name
        .toString()
        .replace(/-./g, (x) => x[1].toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, "");
    return ((Icons as any)[pascal] ?? Icons.Bell) as React.ElementType;
}

function StatusBadge({ value }: { value?: string }) {
    const k = (value ?? "").toLowerCase();
    const cls =
        k === "active"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : k === "resolved"
                ? "bg-sky-50 text-sky-700 ring-sky-200"
                : k === "dismissed"
                    ? "bg-rose-50 text-rose-700 ring-rose-200"
                    : "bg-slate-50 text-slate-700 ring-slate-200";
    return (
        <span className={`px-2 py-0.5 text-xs rounded-full ring-1 ring-inset font-medium ${cls}`}>
            {value}
        </span>
    );
}

function SeverityBadge({ value }: { value?: string }) {
    const k = (value ?? "").toLowerCase();
    const cls =
        k === "critical"
            ? "bg-rose-50 text-rose-700 ring-rose-200"
            : k === "high"
                ? "bg-orange-50 text-orange-700 ring-orange-200"
                : k === "medium"
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-200";
    return (
        <span className={`px-2 py-0.5 text-xs rounded-full ring-1 ring-inset font-medium ${cls}`}>
            {value}
        </span>
    );
}

/* ------------------------------- Card ------------------------------------ */
function RecentAlertCard({ item }: { item: ApiItem }) {
  const EventIcon = iconFromName(item.event_icon);
  const time = formatTime(item.last_alert_at);
  const isVideo = item.footage_path?.toLowerCase().endsWith(".mp4");

  return (
    <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition py-3">
      {/* ✅ Responsive layout: มือถือแนวตั้ง / จอใหญ่แนวนอน */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 py-3">
        {/* 🎥 Left: Footage */}
        <div className="w-full sm:w-56 md:w-60 lg:w-64 shrink-0">
          <div
            className="relative rounded-lg overflow-hidden ring-1 ring-gray-200 bg-gray-100
                       aspect-video sm:aspect-auto sm:min-h-[144px]"
          >
            {isVideo ? (
              <video
                src={item.footage_path!}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : item.footage_path ? (
              <Image
                src={item.footage_path}
                alt="footage"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                <Icons.ImageOff className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>

        {/* 📋 Right: Meta Info */}
        <CardContent className="p-0 flex-1 grid gap-3">
          {/* 🔹 Camera Name (Clickable) + Alert ID badge */}
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={`/cameras/${item.camera_id}`}
                className="text-base sm:text-lg font-semibold text-[var(--color-primary,#2563eb)] hover:underline truncate"
                title={item.camera_name}
              >
                {item.camera_name}
              </Link>
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Icons.MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="truncate">{item.location_name}</span>
              </div>
            </div>

            {/* Alert ID as Badge */}
            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-white border border-gray-200 text-gray-700">
              ALR{String(item.last_alert_id).padStart(3, "0")}
            </span>
          </div>

          {/* 🔹 Event Type */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <EventIcon className="h-4 w-4 text-[var(--color-primary,#2563eb)]" />
            <span className="truncate">{item.event_name}</span>
          </div>

          {/* 🔹 Status + Severity + Time */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={item.last_alert_status} />
            <SeverityBadge value={item.last_alert_severity} />
            <div className="text-sm text-gray-500 flex items-center gap-1 sm:ml-auto">
              <Icons.Clock3 className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>

          {/* 🔹 Active Alerts + View Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-gray-600 flex items-center gap-1.5">
              <Icons.Activity className="h-3.5 w-3.5 text-[var(--color-primary,#2563eb)]" />
              <span>{item.active_alerts ?? 0} active alerts</span>
            </div>

            <Link href={`/alerts/${item.last_alert_id}/details`}>
              <Button className="h-8 px-3 bg-[var(--color-primary,#2563eb)] hover:bg-[var(--color-secondary,#1d4ed8)] text-white">
                <Icons.ArrowUpRight className="h-4 w-4 mr-1" />
                View Last Alert
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/* ------------------------------- Main List -------------------------------- */
export default function RecentAlerts() {
    const [data, setData] = useState<ApiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                const res = await fetch("/api/alerts/recent", { signal: ac.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setData(json?.data ?? []);
            } catch (e: any) {
                if (e.name !== "AbortError") setErr(e.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, []);

    if (loading) return <div className="text-sm text-gray-500">Loading recent alerts...</div>;
    if (err) return <div className="text-sm text-rose-600">Error: {err}</div>;
    if (!data?.length) return <div className="text-sm text-gray-500">No recent alerts available.</div>;

    return (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
            {data.map((item) => (
                <RecentAlertCard key={item.last_alert_id} item={item} />
            ))}
        </div>
    );
}