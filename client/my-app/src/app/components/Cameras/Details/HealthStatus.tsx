"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import { Clock, Video, Signal } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type QuickRange = "3" | "7" | "30";
const BASE_DAYS = 30;

/* ---------- stable date labels (UTC to avoid SSR/CSR mismatch) ---------- */
const dtf = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});
function formatLabelUTC(d: Date) {
  return dtf.format(d);
}
function lastNDaysLabelsUTC(n: number) {
  const out: string[] = [];
  const now = new Date();
  const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(utcToday - i * 24 * 60 * 60 * 1000);
    out.push(formatLabelUTC(d));
  }
  return out;
}

/* ---------- deterministic % series (no randomness) ---------- */
function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}
function genPercentSeriesStable(n: number, base: number, swing: number) {
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const v = base + Math.sin(i / 2) * swing + Math.cos(i / 3) * (swing * 0.35);
    arr.push(Math.round(clamp(v)));
  }
  return arr;
}

/* ---------- small metric card ---------- */
function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}%</div>
      <div className="text-xs text-slate-500">Today</div>
    </div>
  );
}

export default function HealthStatus() {
  const [range, setRange] = useState<QuickRange>("7");
  const points = useMemo(() => Number(range), [range]);

  // ---------- Base 30-day dataset (cards always read from here) ----------
  const baseCategories = useMemo(() => lastNDaysLabelsUTC(BASE_DAYS), []);
  const baseUptime = useMemo(() => genPercentSeriesStable(BASE_DAYS, 97, 3), []);
  const baseVideo  = useMemo(() => genPercentSeriesStable(BASE_DAYS, 92, 6), []);
  const baseNet    = useMemo(() => genPercentSeriesStable(BASE_DAYS, 88, 8), []);

  // Today's (last index of base)
  const todayUptime = baseUptime.at(-1) ?? 0;
  const todayVideo  = baseVideo.at(-1) ?? 0;
  const todayNet    = baseNet.at(-1) ?? 0;
  const overall     = Math.round((todayUptime + todayVideo + todayNet) / 3);

  // ---------- Chart slices only (range affects chart, not cards) ----------
  const categories = useMemo(() => baseCategories.slice(-points), [baseCategories, points]);
  const series = useMemo(
    () => [
      { name: "Uptime", data: baseUptime.slice(-points) },        // green
      { name: "Video Quality", data: baseVideo.slice(-points) },  // blue
      { name: "Network Latency", data: baseNet.slice(-points) },  // yellow (quality %)
    ],
    [baseUptime, baseVideo, baseNet, points]
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false },
        foreColor: "#687280",
      },
      stroke: { width: 2, curve: "smooth" },
      markers: {
        size: 3, strokeWidth: 2, strokeColors: "#ffffff", hover: { size: 5 },
      },
      legend: {
        position: "top",
        horizontalAlign: "left",
        fontSize: "12px",
        markers: { size: 8, strokeWidth: 0 },
        itemMargin: { horizontal: 12, vertical: 4 },
      },
      colors: ["#22c55e", "#2563eb", "#eab308"], // green, blue, yellow
      grid: {
        borderColor: "rgba(0,0,0,0.06)",
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (v?: number) => (typeof v === "number" ? `${v.toFixed(0)}%` : "") },
      },
      yaxis: {
        min: 0, max: 100, tickAmount: 4,
        labels: { formatter: (v) => `${v}%` },
      },
      xaxis: {
        categories,
        tickAmount: Math.min(6, categories.length),
        axisBorder: { color: "rgba(0,0,0,0.08)" },
        axisTicks: { color: "rgba(0,0,0,0.08)" },
      },
    }),
    [categories]
  );

  return (
    <div className="w-full">
      {/* ===== Top: Overall + Today cards (fixed to today) ===== */}
      <div className="mb-4 space-y-3">
        {/* Overall Health Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-800">Overall Health</h3>
            <span className="text-slate-700 font-medium">{overall}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={overall}
            className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
          >
            <div
              className="h-full bg-[var(--color-success)] rounded-full transition-[width] duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>

        {/* Today metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard icon={<Clock className="w-4 h-4 text-[#22c55e]" />} label="Uptime" value={todayUptime} />
          <MetricCard icon={<Video className="w-4 h-4 text-[#2563eb]" />} label="Video Quality" value={todayVideo} />
          <MetricCard icon={<Signal className="w-4 h-4 text-[#eab308]" />} label="Network" value={todayNet} />
        </div>
      </div>

      {/* ===== Header + Range selector (affects chart only) ===== */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]">Health Metrics</h2>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 bg-white">
          {(["3", "7", "30"] as QuickRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                range === r ? "bg-[var(--color-primary)] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
              aria-pressed={range === r}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {/* ===== Chart (slices only) ===== */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <ReactApexChart type="line" height={320} options={options} series={series} />
      </div>

      {/* <p className="mt-2 text-xs text-slate-500">
        Daily values shown in %. “Network Latency” is visualized as overall network quality (higher is better).
      </p> */}
    </div>
  );
}