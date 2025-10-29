"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";

/* -------------------------------- Types ---------------------------------- */
type LogItem = {
  log_id: number;
  creator_id?: number | null;
  creator_username?: string | null;
  creator_name?: string | null;
  creator_role?: string | null;
  alert_id: number;
  action: string;
  created_at: string;
  note?: string | null;
};

/* ------------------------------ Main Component --------------------------- */
export default function EventTimeline({ alrId }: { alrId: number }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/alerts/${alrId}/logs`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

        const rows: LogItem[] = Array.isArray(json?.data) ? json.data : [];
        // เรียงจากเก่า → ใหม่
        rows.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        if (mounted) {
          setLogs(rows);
          setPage(1);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load timeline");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [alrId]);

  if (err)
    return <div className="text-sm text-red-600">Error: {err}</div>;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3 animate-pulse"
          >
            <div className="h-9 w-9 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-3/5 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!logs.length) {
    return <div className="text-sm text-gray-500">No activity yet.</div>;
  }

  // ---------------- Pagination ----------------
  const total = logs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const pageLogs = logs.slice(start, end);

  return (
    <div className="space-y-3">
      {pageLogs.map((log) => (
        <TabCard key={log.log_id} log={log} />
      ))}

      {/* Pagination bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-gray-500">
          Showing <span className="font-medium">{start + 1}</span>–
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-3 py-1 rounded-md border text-sm ${page <= 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            Previous
          </button>
          <div className="text-sm tabular-nums">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-3 py-1 rounded-md border text-sm ${page >= totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- TabCard -------------------------------- */
function TabCard({ log }: { log: LogItem }) {
  const meta = useMemo(() => mapActionMeta(log), [log]);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Left: Icon + Text */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Icon */}
        <div
          className={[
            "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
            meta.bgRing,
          ].join(" ")}
          aria-hidden
        >
          <meta.Icon className={["w-5 h-5", meta.iconColor].join(" ")} />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-[var(--color-primary)] truncate">
            {meta.title}
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {meta.description}
          </div>
          {log.note ? (
            <div className="mt-1 text-xs text-gray-500 whitespace-pre-wrap break-words">
              {log.note}
            </div>
          ) : null}
        </div>
      </div>

      {/* Right: Time */}
      <div className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap sm:mt-0 mt-2 sm:self-auto self-start">
        <Icons.Clock className="w-4 h-4 opacity-70" />
        {formatDateTime(log.created_at)}
      </div>
    </div>
  );
}

/* ----------------------------- Action meta map ---------------------------- */
function mapActionMeta(log: LogItem) {
  const action = (log.action || "").toUpperCase();

  let title = "Activity";
  let description = "";
  let Icon = Icons.Dot;
  let iconColor = "text-slate-600";
  let bgRing = "bg-slate-50 ring-1 ring-inset ring-slate-200";

  const by = log.creator_id ? ` by @${log.creator_username}` : "";

  if (action === "CREATE" || action === "CREATE_ALERT") {
    title = "Alert Generated";
    Icon = Icons.BellRing;
    iconColor = "text-sky-600";
    bgRing = "bg-sky-50 ring-1 ring-inset ring-sky-200";
    description = `System created this alert${by}.`;
  } else if (action === "UPDATE") {
    title = "Alert Updated";
    Icon = Icons.Pencil;
    iconColor = "text-amber-600";
    bgRing = "bg-amber-50 ring-1 ring-inset ring-amber-200";
    description = `Alert details were updated${by}.`;
  } else if (action === "UPDATE_STATUS") {
    title = "Status Updated";
    Icon = Icons.CheckCircle2;
    iconColor = "text-sky-700";
    bgRing = "bg-sky-50 ring-1 ring-inset ring-sky-200";
    description = `Alert status was updated${by}.`;
  } else if (action === "DELETE") {
    title = "Alert Deleted";
    Icon = Icons.Trash2;
    iconColor = "text-rose-600";
    bgRing = "bg-rose-50 ring-1 ring-inset ring-rose-200";
    description = `Alert removed${by}.`;
  } else if (action === "VIEW" || action === "VIEWER") {
    title = "Alert Viewed";
    Icon = Icons.Eye;
    iconColor = "text-emerald-600";
    bgRing = "bg-emerald-50 ring-1 ring-inset ring-emerald-200";
    description = `Alert was viewed${by}.`;
  } else {
    title = action || "Activity";
    description = `Action logged${by}.`;
  }

  return { title, description, Icon, iconColor, bgRing };
}

/* --------------------------------- utils ---------------------------------- */
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function formatDateTime(input: string, tz = "Asia/Bangkok") {
  const d = new Date(input.replace(" ", "T"));
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}