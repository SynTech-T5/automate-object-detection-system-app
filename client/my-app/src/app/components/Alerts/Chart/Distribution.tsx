"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ========================= Types & Constants ========================= */
type TableAlert = {
  id: number;
  severity: string;
  create_date: string;          // "yyyy-mm-dd"
  create_time?: string;         // "HH:mm:ss"
  alert_description?: string;
  camera: { name: string; location: { name: string } };
  event: { name: string; icon?: string };
  status: string;
};

// หากจะให้รองรับ ApiAlert ด้วย ก็ใช้ union type ได้
type InputItem = TableAlert;

type QuickRange = "1week" | "1month" | "3month" | "1year";
const TZ = "Asia/Bangkok";

/** Soft palette ที่อ่านง่าย (คงโทน minimal) */
const PALETTE = [
  "#93C5FD", // blue-300
  "#86EFAC", // green-300
  "#FCD34D", // amber-300
  "#FCA5A5", // rose-300
  "#D8B4FE", // violet-300
  "#67E8F9", // cyan-300
  "#F9A8D4", // pink-300
  "#A5B4FC", // indigo-300
  "#FDBA74", // orange-300
  "#A7F3D0", // emerald-300
];

/* ============================== Utils =============================== */
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

/** ดึง yyyy-mm-dd จาก TableAlert */
function getItemDateYMD(item: InputItem): string | null {
  const d = item.create_date;
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

/* ============================= Component ============================ */
type Props = {
  /** เอามาจาก filtered ของ AlertView */
  items: InputItem[];
  /** default: "1week" */
  initialRange?: QuickRange;
};

export default function AlertsDistributionChart({ items, initialRange = "1week" }: Props): React.ReactElement {
  const [range, setRange] = useState<QuickRange>(initialRange);
  const [{ start, end }, setDates] = useState({ start: "", end: "" });

  useEffect(() => setDates(getRangeDates(range)), [range]);

  // คำนวณ distribution ตาม event_name ภายในช่วงวันที่เลือก
  const { series, labels } = useMemo(() => {
    if (!start || !end) return { series: [] as number[], labels: [] as string[] };

    const counter = new Map<string, number>();

    for (const it of items) {
      const ymd = getItemDateYMD(it);
      if (!ymd) continue;
      if (ymd < start || ymd > end) continue;

      const evtName = (it.event?.name ?? "").trim() || "Unknown";
      counter.set(evtName, (counter.get(evtName) ?? 0) + 1);
    }

    // เรียงจากมาก → น้อย เพื่ออ่านง่าย
    const sorted = Array.from(counter.entries()).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([name]) => name);
    const series = sorted.map(([, count]) => count);

    return { series, labels };
  }, [items, start, end, range]);

  const options: ApexOptions = {
    chart: { type: "donut", toolbar: { show: false } },
    labels,
    colors: labels.map((_, i) => PALETTE[i % PALETTE.length]),
    legend: {
      position: "bottom",
      fontSize: "13px",
      labels: { colors: "#6B7280" },
      markers: { size: 8 },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { show: false },
            value: { fontSize: "18px", fontWeight: 600, color: "#111827" },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              color: "#6B7280",
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString(),
            },
          },
        },
      },
    },
    stroke: { show: false },
    tooltip: {
      y: {
        formatter: (val) => `${val}`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: "100%" },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <div className="w-full">
      {/* Quick Range (เหมือน AlertsTrendChart) */}
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

      <div className="w-full flex justify-center">
        <ReactApexChart options={options} series={series} type="donut" width={360} />
      </div>
    </div>
  );
}