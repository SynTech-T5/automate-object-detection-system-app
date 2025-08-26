"use client";
import { useEffect, useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import type { EventItem, EventSensitivity } from "./types";

export default function EventGrid({
  className,
  onEdit,
  onDelete,
  endpoint = "/api/events",
}: {
  className?: string;
  onEdit?: (item: EventItem) => void;
  onDelete?: (item: EventItem) => void;
  endpoint?: string;
}) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<EventItem["id"] | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const data: EventItem[] = (raw as any[]).map((r) => ({
          id: r.id,
          icon: r.icon,
          name: r.name,
          description: r.description,
          status: Boolean(r.status),
          is_use: Boolean(r.is_use),
          sensitivity: (r.sensitivity as EventSensitivity) ?? "Medium",
        }));
        if (alive) setItems(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load events");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [endpoint]);

  async function toggleEnabled(id: EventItem["id"], next: boolean) {
    setBusyId(id);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: next } : it)));
    try {
      await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    } catch {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: !next } : it)));
    } finally {
      setBusyId(null);
    }
  }

  async function updateItem(next: EventItem) {
    setBusyId(next.id);
    setItems((prev) => prev.map((it) => (it.id === next.id ? next : it)));
    try {
      await fetch(`${endpoint}/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: next.name,
          description: next.description,
          sensitivity: next.sensitivity,
          status: next.status,
          is_use: next.is_use,
          icon: next.icon,
        }),
      });
    } finally {
      setBusyId(null);
    }
  }

  const gridCols = useMemo(
    () =>
      "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
    []
  );

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-destructive">
        Failed to load events: {error}
      </div>
    );
  }

  return (
    <div className={`${gridCols} ${className ?? ""}`}>
      {items.map((it) => (
        <EventCard
          key={it.id}
          item={it}
          onToggle={toggleEnabled}
          onEdit={(v) => (onEdit ? onEdit(v) : updateItem(v))}
          onDelete={(v) => onDelete?.(v)}
          disabled={busyId === it.id}
        />
      ))}
    </div>
  );
}