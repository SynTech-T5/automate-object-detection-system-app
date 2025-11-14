"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* =========================================================
   Types (รองรับทั้ง TableAlert และ ApiAlert)
========================================================= */
type TableAlert = {
  id: number;
  severity: string;            // "critical" | "high" | "medium" | "low"
  create_date: string;         // "yyyy-mm-dd"
  create_time?: string;        // "HH:mm:ss"
  alert_description?: string;
  camera: { name: string; location: { name: string } };
  event: { name: string; icon?: string };
  status: string;
};

type ApiAlert = {
  severity: string;
  alert_id: number;
  created_at: string;          // ISO
  description?: string;
  camera_id: number;
  camera_name: string;
  event_icon?: string;
  event_name: string;
  location_name: string;
  alert_status: string;
  footage_id?: number;
  footage_path?: string;
  created_by?: string;
};

type QuickRange = "1week" | "1month" | "3month" | "1year";
const TZ = "Asia/Bangkok";

/* =========================================================
   Soft Minimal Colors (โทนเดียวกับ table)
========================================================= */
const SEVERITY_COLORS: Record<"critical" | "high" | "medium" | "low", string> = {
  critical: "#F87171", // rose-400
  high: "#FB923C",     // orange-400
  medium: "#FACC15",   // yellow-400
  low: "#4ADE80",      // emerald-400
};
const ORDERED = ["critical", "high", "medium", "low"] as const;

/* =========================================================
   Utilities
========================================================= */
function toYMD_TZ(value: number | Date, tz = TZ): string {
  const d = typeof value === "number" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d); // yyyy-mm-dd
}

function getRangeDates(range: QuickRange, tz = TZ) {
  const now = Date.now();
  const end = toYMD_TZ(now, tz);
  const days =
    range === "1week" ? 7 :
    range === "1month" ? 30 :
    range === "3month" ? 90 : 365;
  const start = toYMD_TZ(now - (days - 1) * 86400000, tz);
  return { start, end };
}

function getGroupRange(dateYMD: string, range: QuickRange): { start: string; end: string } {
  const d = new Date(dateYMD + "T00:00:00");
  const fmt = (dt: Date) => toYMD_TZ(dt, TZ);

  if (range === "1week") {
    return { start: fmt(d), end: fmt(d) };
  }
  if (range === "1month") {
    const day = d.getDate();
    const groupStartDay = day - ((day - 1) % 3); // 1,4,7,...
    const start = new Date(d.getFullYear(), d.getMonth(), groupStartDay);
    const end = new Date(d.getFullYear(), d.getMonth(), groupStartDay + 2);
    return { start: fmt(start), end: fmt(end) };
  }
  if (range === "3month") {
    // เริ่มสัปดาห์วันอาทิตย์
    const weekday = d.getDay(); // 0=Sun
    const start = new Date(d);
    start.setDate(d.getDate() - weekday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: fmt(start), end: fmt(end) };
  }
  // 1year → รายเดือน
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: fmt(start), end: fmt(end) };
}

function groupLabel(dateYMD: string, range: QuickRange): string {
  return getGroupRange(dateYMD, range).start; // label = วันเริ่มกลุ่ม (yyyy-mm-dd)
}

/** ดึงวันที่ (yyyy-mm-dd) จากทั้ง TableAlert และ ApiAlert */
function getItemDateYMD(item: TableAlert | ApiAlert): string | null {
  // TableAlert
  if ((item as TableAlert).create_date) {
    const d = (item as TableAlert).create_date;
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }
  // ApiAlert
  if ((item as ApiAlert).created_at) {
    const iso = (item as ApiAlert).created_at;
    const dt = new Date(iso);
    if (!isNaN(+dt)) return toYMD_TZ(dt, TZ);
  }
  return null;
}

type Props = {
  /** เอามาจาก filtered ใน AlertView */
  items: (TableAlert | ApiAlert)[];
  /** default: "1week" */
  initialRange?: QuickRange;
};

export default function AlertsTrendChart({ items, initialRange = "1week" }: Props) {
  const [range, setRange] = useState<QuickRange>(initialRange);
  const [{ start, end }, setDates] = useState({ start: "", end: "" });

  useEffect(() => setDates(getRangeDates(range)), [range]);

  const { categories, series, groupRanges } = useMemo(() => {
    if (!start || !end) return {
      categories: [] as string[],
      series: [] as NonNullable<ApexOptions["series"]>,
      groupRanges: [] as { start: string; end: string }[],
    };

    const map = new Map<string, Record<string, number>>();
    const rangeMap = new Map<string, { start: string; end: string }>();

    for (const it of items) {
      const ymd = getItemDateYMD(it);
      if (!ymd) continue;
      if (ymd < start || ymd > end) continue;

      const label = groupLabel(ymd, range);
      const gr = getGroupRange(ymd, range);
      if (!rangeMap.has(label)) rangeMap.set(label, gr);

      const sev = String((it as any).severity ?? "").toLowerCase();
      if (!["critical", "high", "medium", "low"].includes(sev)) continue;

      if (!map.has(label)) map.set(label, { critical: 0, high: 0, medium: 0, low: 0 });
      map.get(label)![sev] += 1;
    }

    const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    const categories = sorted.map(([label]) => label);
    const groupRanges = categories.map((c) => rangeMap.get(c)!);

    const series = (["critical", "high", "medium", "low"] as const).map((sev) => ({
      name: sev.charAt(0).toUpperCase() + sev.slice(1),
      data: categories.map((c) => map.get(c)?.[sev] ?? 0),
    }));

    return { categories, series, groupRanges };
  }, [items, start, end, range]);

  const makeTooltip = (
    cats: string[],
    srs: any[],
    ranges: { start: string; end: string }[]
  ): ApexOptions["tooltip"] => ({
    shared: true,
    intersect: false,
    custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
      if (dataPointIndex == null) return "";
      const label = cats[dataPointIndex]; // yyyy-mm-dd (วันเริ่มกลุ่ม)
      const gr = ranges[dataPointIndex];
      const period = gr && (gr.start !== gr.end) ? `${gr.start} → ${gr.end}` : label;

      const rows = ORDERED.map((sev, i) => {
        const val = Number(srs[i]?.data?.[dataPointIndex] ?? 0);
        return `<div style="display:flex;justify-content:space-between;margin:2px 0;">
          <span>${sev.charAt(0).toUpperCase() + sev.slice(1)}</span><strong>${val}</strong>
        </div>`;
      }).join("");

      const total = ORDERED.reduce((acc, _, i) => acc + Number(srs[i]?.data?.[dataPointIndex] ?? 0), 0);

      return `<div style="padding:8px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;min-width:220px;">
        <div style="font-weight:600;margin-bottom:6px;">${period}</div>
        ${rows}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0;"/>
        <div style="display:flex;justify-content:space-between;">
          <span>Total</span><strong>${total}</strong>
        </div>
      </div>`;
    },
  });

  const options: ApexOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: true } },
    colors: ORDERED.map((sev) => SEVERITY_COLORS[sev]),
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "13px",
      labels: { colors: "#6B7280" },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    xaxis: {
      type: "category",
      categories,
      title: { text: "X: Date", offsetY: 6, style: { fontSize: "12px" } },
      labels: {
        formatter: (val: string) => val, // แสดง yyyy-mm-dd ตรง ๆ
        style: { colors: Array(categories.length).fill("#6B7280"), fontSize: "12px" },
      },
      axisBorder: { color: "#E5E7EB" },
      axisTicks: { color: "#E5E7EB" },
    },
    yaxis: {
      title: { text: "Y: Total Alerts", style: { fontSize: "12px" } },
      labels: { style: { colors: ["#6B7280"], fontSize: "12px" } },
    },
    grid: { borderColor: "#F3F4F6", yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    fill: { opacity: 0.9 },
    tooltip: makeTooltip(categories, series as any, groupRanges),
    responsive: [{ breakpoint: 640, options: { plotOptions: { bar: { columnWidth: "65%" } } } }],
  };

  return (
    <div className="w-full">
      {/* Quick Range */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["1week", "1month", "3month", "1year"] as QuickRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full border px-3 py-1 text-sm transition
              ${range === r
                ? "bg-[var(--color-primary)] text-[var(--color-white)] border-transparent"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            aria-pressed={range === r}
          >
            {r}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500" suppressHydrationWarning>
          Range: {start || "—"} → {end || "—"}
        </span>
      </div>

      <ReactApexChart options={options} series={series} type="bar" height={360} />
    </div>
  );
}