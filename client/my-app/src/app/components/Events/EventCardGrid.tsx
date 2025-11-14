"use client";

import { useEffect, useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import type { Event } from "../../models/events.model";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export default function EventCardGrid({
  className,
  onEdit,
  onDelete,
  endpoint = "/api/events",
  fetcher,
}: {
  className?: string;
  onEdit?: (item: Event) => void;
  onDelete?: (item: Event) => void;
  endpoint?: string;
  fetcher?: Fetcher;
}) {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<Event["event_id"] | null>(null);

  const doFetch: Fetcher =
    fetcher ?? (typeof fetch !== "undefined" ? fetch : (async () => new Response()) as any);

  function authHeaders(): HeadersInit {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (process.env.NEXT_PUBLIC_TOKEN) {
      h.Authorization = `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`;
    }
    return h;
    }

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await doFetch(`${endpoint}/global`, {
          method: "GET",
          headers: authHeaders(),
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const data = (Array.isArray(raw?.data) ? raw.data : []) as Event[];
        if (alive) setItems(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Failed to load events");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [endpoint, doFetch]);

  /** รวมค่าปัจจุบัน + ที่จะเปลี่ยน แล้วยิง PUT */
  async function putMerged(id: number, patch: Partial<Pick<Event,"sensitivity"|"priority"|"status">>) {
    // หา current
    const cur = items.find(x => x.event_id === id);
    if (!cur) return;

    const merged: Pick<Event,"sensitivity"|"priority"|"status"> = {
      sensitivity: (patch.sensitivity ?? cur.sensitivity) as any,
      priority: (patch.priority ?? cur.priority) as any,
      status: (patch.status ?? cur.status) as boolean,
    };

    // optimistic
    setItems(prev => prev.map(it => it.event_id === id ? { ...it, ...merged } : it));

    try {
      setBusyId(id);
      const res = await doFetch(`${endpoint}/${id}/global`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          sensitivity: merged.sensitivity,
          priority: merged.priority,
          status: merged.status,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      // rollback ง่ายๆด้วยการดึงของเดิมจาก cur
      setItems(prev => prev.map(it => it.event_id === id ? cur : it));
      console.error(err);
    } finally {
      setBusyId(null);
    }
  }

  // Toggle → เรียก PUT พร้อมรวมค่าปัจจุบันของ sensitivity/priority
  async function toggleEnabled(id: Event["event_id"], next: boolean) {
    await putMerged(id, { status: next });
  }

  // จาก dropdown → onEdit ส่ง item ทั้งตัวมา เราใช้เฉพาะ field ที่เกี่ยวแล้ว PUT
  async function updateItem(next: Event) {
    const patch: Partial<Pick<Event,"sensitivity"|"priority"|"status">> = {};
    // เราถือว่า next คือค่าที่ “ถูกแก้แล้ว” จากการ์ด
    patch.sensitivity = next.sensitivity;
    patch.priority = next.priority;
    patch.status = next.status;
    await putMerged(next.event_id, patch);
  }

  const gridCols = useMemo(
    () => "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
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
          key={it.event_id}
          item={it}
          onToggle={toggleEnabled}
          onEdit={(v) => (onEdit ? onEdit(v) : updateItem(v))}
          onDelete={(v) => onDelete?.(v)}
          disabled={busyId === it.event_id}
        />
      ))}
    </div>
  );
}