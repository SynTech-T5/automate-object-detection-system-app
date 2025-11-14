"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import DynamicLucideIcon from "@/app/components/Utilities/DynamicLucide";
import { Button } from "@/components/ui/button";

/* ------------------------------- Types ----------------------------------- */
type RelatedAlert = {
  severity: string;
  alert_id: number;
  created_at: string;
  camera_id: number;
  camera_name: string;
  event_icon?: string | null;
  event_name?: string | null;
  location_name?: string | null;
  alert_status?: string | null;
  /** ✅ เพิ่ม description เข้ามา */
  alert_description?: string | null;
};

type Props = { alrId: number };

/* ----------------------------- Utilities --------------------------------- */
function pad(n: number) { return n.toString().padStart(2, "0"); }
function formatDateTime(input: string) {
  const d = new Date(input.replace(" ", "T"));
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function SeverityBadge({ value }: { value?: string }) {
  const v = (value ?? "").toLowerCase();
  const map: Record<string, { cls: string; Icon: any; label: string }> = {
    critical: { cls: "bg-rose-50 text-rose-700 ring-rose-200",   Icon: Icons.TriangleAlert, label: "Critical" },
    high:     { cls: "bg-orange-50 text-orange-700 ring-orange-200", Icon: Icons.CircleAlert,   label: "High" },
    medium:   { cls: "bg-yellow-50 text-yellow-700 ring-yellow-200", Icon: Icons.Minus,         label: "Medium" },
    low:      { cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: Icons.ArrowDown,  label: "Low" },
  };
  const { cls, Icon, label } = map[v] ?? { cls: "bg-slate-50 text-slate-700 ring-slate-200", Icon: Icons.CircleAlert, label: value ?? "Unknown" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> <span className="capitalize">{label}</span>
    </span>
  );
}

function StatusBadge({ value }: { value?: string | null }) {
  const v = (value ?? "").toLowerCase();
  const cls =
    v === "active"    ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
    v === "resolved"  ? "bg-sky-50 text-sky-700 ring-sky-200" :
    v === "dismissed" ? "bg-rose-50 text-rose-700 ring-rose-200" :
                        "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* ---------------------------- Main Component ----------------------------- */
export default function RelatedAlerts({ alrId }: Props) {
  const [items, setItems] = useState<RelatedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/alerts/${alrId}/related`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
        const rows: RelatedAlert[] = Array.isArray(json?.data) ? json.data : [];

        // ตัด alert ตัวเอง + เรียงใหม่→เก่า
        const filtered = rows
          .filter(r => r.alert_id !== alrId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (mounted) {
          setItems(filtered);
          setPage(1);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load related alerts");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [alrId]);

  if (err) return <div className="text-sm text-red-600">Error: {err}</div>;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-3/5 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <div className="text-sm text-gray-500">No related alerts.</div>;
  }

  // slice ตามหน้า
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageItems = items.slice(start, end);

  return (
    <div className="space-y-3">
      {pageItems.map((it) => (
        <RelatedCard key={it.alert_id} item={it} />
      ))}

      {/* Pagination bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-gray-500">
          Showing <span className="font-medium">{start + 1}</span>–<span className="font-medium">{end}</span> of <span className="font-medium">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="text-sm tabular-nums">
            {page} / {totalPages}
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Tabcard -------------------------------- */
function RelatedCard({ item }: { item: RelatedAlert }) {
  const router = useRouter();
  const altCode = `ALT${String(item.alert_id).padStart(3, "0")}`;
  const title = item.event_name ?? "Unknown Event";
  const iconName: string | undefined = (item.event_icon ?? item.event_name) || undefined;

  const onView = () => router.push(`/alerts/${item.alert_id}/details`);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-2">
      {/* ชั้นบน: Icon + คอนเทนต์ (อยู่ข้างกันเสมอ) */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-50 ring-1 ring-inset ring-slate-200"
          aria-hidden
        >
          <DynamicLucideIcon name={iconName} fallback="Bell" className="w-5 h-5 text-[var(--color-primary)]" />
        </div>

        {/* ข้อความ */}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-[var(--color-primary)] truncate">
            {title}
          </div>

          {/* แถวรอง: Alert ID + Severity + Status */}
          <div className="mt-1 text-sm text-gray-700 flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-white border border-gray-200 text-gray-700">
              {altCode}
            </span>
            <SeverityBadge value={item.severity} />
            <StatusBadge value={item.alert_status} />
          </div>

          {/* ✅ Description (มี label ชัดเจน) */}
          {item.alert_description ? (
            <div className="mt-1 text-sm text-gray-600 break-words">
              <span className="text-xs text-gray-500 mr-1">Description:</span>
              <span>{item.alert_description}</span>
            </div>
          ) : null}
        </div>

        {/* ปุ่ม View (วางขวาบน) */}
        <Button
          type="button"
          onClick={onView}
          className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] h-8 px-3"
        >
          View
        </Button>
      </div>

      {/* ชั้นล่าง: เวลา (ขวาเดสก์ท็อป, ล่างซ้ายบนมือถือ) */}
      <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap sm:self-end self-start">
        <Icons.Clock className="w-4 h-4 opacity-70" />
        {formatDateTime(item.created_at)}
      </div>
    </div>
  );
}