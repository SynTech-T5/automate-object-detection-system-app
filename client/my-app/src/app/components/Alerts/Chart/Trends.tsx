"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Severity = "Critical" | "High" | "Medium" | "Low";
type TrendPoint = { severity: Severity; count: number };
type TrendItem = { date: string; trend: TrendPoint[] };
type QuickRange = "3d" | "7d" | "30d";

const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low"];
const TZ = "Asia/Bangkok";

/** format เป็น YYYY-MM-DD ตามโซนเวลาเป้าหมาย (ไม่พึ่ง getFullYear/getMonth) */
function toYMD_TZ(value: number | Date, tz = TZ): string {
  const d = typeof value === "number" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

/** คำนวณช่วงวันฝั่ง client เท่านั้น (ป้องกัน SSR/CSR ไม่ตรงกัน) */
function getRangeDatesClient(range: QuickRange, tz = TZ): { start: string; end: string } {
  const delta = range === "3d" ? 3 : range === "7d" ? 7 : 30;
  const now = Date.now();
  const end = toYMD_TZ(now, tz);
  const start = toYMD_TZ(now - (delta - 1) * 86400000, tz); // Bangkok ไม่มี DST ใช้ 86400000 ได้
  return { start, end };
}

/** ไล่เฉดสีจากสีหลัก (โทนเดียวคนละความเข้ม) */
function generateMonochromeShades(base: string): string[] {
  const hex = base.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (t: number) => {
    const bg = 255;
    const rr = Math.round(r * (1 - t) + bg * t);
    const gg = Math.round(g * (1 - t) + bg * t);
    const bb = Math.round(b * (1 - t) + bg * t);
    return `#${rr.toString(16).padStart(2, "0")}${gg
      .toString(16)
      .padStart(2, "0")}${bb.toString(16).padStart(2, "0")}`.toUpperCase();
  };
  return [mix(0.15), mix(0.35), mix(0.55), mix(0.78)];
}

/** ย่อ label โดยไม่พึ่ง Date (กัน timezone เพี้ยน) */
function shortLabel(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [y, m, d] = ymd.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[Number(m) - 1]}`;
}

export default function AlertsTrendChart(): React.ReactElement {
  const [range, setRange] = useState<QuickRange>("7d");

  // เริ่มต้นเป็นค่าว่าง → ค่อยคำนวณบน client ใน useEffect (กัน hydration mismatch)
  const [{ start, end }, setDates] = useState<{ start: string; end: string }>({ start: "", end: "" });

  const [raw, setRaw] = useState<TrendItem[]>([]);
  const [series, setSeries] = useState<NonNullable<ApexOptions["series"]>>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // อ่านสีหลักจาก CSS var แล้วสร้างเฉด
  const palette = useMemo(() => {
    if (typeof window === "undefined") {
      return ["#1E3A8A", "#2563EB", "#3B82F6", "#93C5FD"]; // fallback
    }
    const styles = getComputedStyle(document.documentElement);
    const primary = (styles.getPropertyValue("--color-primary") || "#0077FF").trim();
    return generateMonochromeShades(primary);
  }, []);

  // เปลี่ยนช่วง → คำนวณวันที่ฝั่ง client เท่านั้น
  useEffect(() => {
    setDates(getRangeDatesClient(range));
  }, [range]);

  // ดึงข้อมูลเมื่อมี start/end แล้ว
  useEffect(() => {
    if (!start || !end) return;
    (async () => {
      try {
        const url = `/api/alerts/analytics/trend?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
        const res = await fetch(url, { cache: "no-store" });
        const data: TrendItem[] = await res.json();
        setRaw(data);
      } catch (e) {
        console.error("Error fetching trend data:", e);
        setRaw([]);
      }
    })();
  }, [start, end]);

  // map raw → categories + series (กรองซ้ำตามช่วง)
  useEffect(() => {
    if (!start || !end) return;

    const inRange = raw.filter((d) => d.date >= start && d.date <= end);
    const sorted = [...inRange].sort((a, b) => a.date.localeCompare(b.date));
    const cats = sorted.map((d) => d.date);

    const getCount = (arr: TrendPoint[], sev: Severity) =>
      arr.find((t) => t.severity === sev)?.count ?? 0;

    const s: NonNullable<ApexOptions["series"]> = [
      { name: "Critical", data: sorted.map((d) => getCount(d.trend, "Critical")) },
      { name: "High", data: sorted.map((d) => getCount(d.trend, "High")) },
      { name: "Medium", data: sorted.map((d) => getCount(d.trend, "Medium")) },
      { name: "Low", data: sorted.map((d) => getCount(d.trend, "Low")) },
    ];

    setCategories(cats);
    setSeries(s);
  }, [raw, start, end]);

  const options: ApexOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: true }, zoom: { enabled: true } },
    colors: palette,
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
      labels: {
        style: { colors: Array(categories.length).fill("#6B7280"), fontSize: "12px" },
        formatter: (val: string) => shortLabel(val),
      },
      axisBorder: { color: "#E5E7EB" },
      axisTicks: { color: "#E5E7EB" },
    },
    yaxis: { labels: { style: { colors: ["#6B7280"], fontSize: "12px" } } },
    grid: { borderColor: "#F3F4F6", yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    fill: { opacity: 1 },
    tooltip: { theme: "light" },
    responsive: [{ breakpoint: 640, options: { plotOptions: { bar: { columnWidth: "65%" } } } }],
  };

  return (
    <div className="w-full">
      {/* Quick Range */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["3d", "7d", "30d"] as QuickRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full border px-3 py-1 text-sm transition
              ${range === r
                ? "bg-[var(--color-primary)] text-[var(--color-white)] border-transparent"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            aria-pressed={range === r}
          >
            {r === "3d" ? "Last 3 days" : r === "7d" ? "Last 7 days" : "Last 30 days"}
          </button>
        ))}

        {/* ใช้ suppressHydrationWarning กันกรณี edge ที่ SSR/CSR ต่างวันขณะเที่ยงคืน */}
        <span className="ml-auto text-xs text-gray-500" suppressHydrationWarning>
          Range: {start || "—"} → {end || "—"}
        </span>
      </div>

      {/* chart แสดงเฉพาะตอน client อยู่แล้วเพราะ react-apexcharts ssr:false */}
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}