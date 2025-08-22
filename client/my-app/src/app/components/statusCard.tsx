"use client";

import React from "react";
import {
  Bell, Video, Info, CheckCircle2, XCircle, AlertTriangle, Heart
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** ชุดไอคอน: "fi" (flaticon) | "lucide" */
const ICON_SET: "fi" | "lucide" = "lucide";
const base = process.env.NEXT_PUBLIC_APP_URL!;

/* ---------------------------------- Types --------------------------------- */
interface CameraStatus {
  total: number;
  active: number;
  inactive: number;
  avg_health: number;
}

interface StatusCardProps {
  id: number;
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  IconComponent: React.ReactNode; // flaticon หรือ lucide ก็ได้
}

interface SummaryCardBase {
  id: number;
  title: string;
  value: string;         // ค่า default (จะถูกแทนด้วยค่าจาก summary)
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  fi: string;            // flaticon class
  lucide: LucideIcon;    // lucide component
}

/* --------------------------- Shared Style (base) --------------------------- */
const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-md border border-gray-100 " +
  "min-h-[120px] flex";

/* ------------------------------- StatusCard -------------------------------- */
const StatusCard: React.FC<StatusCardProps> = ({
  id, title, value, totalValue, subtitle, IconComponent, textColorClass
}) => {
  const isAlerts = [1, 3, 5, 7].includes(id);
  const innerPad = isAlerts
    ? "px-[20px] sm:px-[24px] pt-[14px] pb-[15px]"
    : "px-[20px] sm:px-[24px] py-[20px] sm:py-[22px]";

  return (
    <div className={cardBase}>
      <div className={`flex flex-1 flex-col justify-center items-start text-left ${innerPad}`}>
        <h4 className="text-base font-medium text-[#000000]">{title}</h4>

        <div className="mt-2 flex items-center gap-x-[10px]">
          <div className={`w-[30px] h-[30px] flex items-center justify-center ${textColorClass}`}>
            {IconComponent}
          </div>

          <div className="flex items-baseline gap-x-1">
            <span className={`text-[24px] font-medium pb-1 ${textColorClass}`}>{value}</span>
            {!!totalValue && (
              <>
                <span className="text-[16px] text-[#8C8686] font-medium pb-1">/</span>
                <span className="text-[12px] text-[#8C8686] font-medium pb-1">{totalValue}</span>
              </>
            )}
          </div>
        </div>

        {!!subtitle && (
          <p className={`${isAlerts ? "text-[10px] font-medium text-[#8C8686]" : "text-[12px] font-normal text-gray-500"} mt-1`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/* ----------------------------- Skeleton (โหลด) ---------------------------- */
const StatusSkeleton = () => (
  <div className={cardBase}>
    <div className="flex flex-1 flex-col justify-center items-start px-5 py-4">
      <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
      <div className="mt-3 flex items-center gap-3">
        <div className="h-[30px] w-[30px] rounded bg-gray-200 animate-pulse" />
        <div className="h-6 w-16 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="mt-2 h-3 w-24 rounded bg-gray-200 animate-pulse" />
    </div>
  </div>
);

/* -------------------------- Cards Data (meta) ----------------------------- */
const summaryCardsBase: SummaryCardBase[] = [
  { id: 1, title: "Total Alerts", value: "—", subtitle: "Last 7 days", fi: "fi fi-br-bells", lucide: Bell, textColorClass: "text-[var(--color-primary)]" },
  { id: 2, title: "Total Cameras", value: "—", fi: "fi fi-br-video-camera-alt", lucide: Video, textColorClass: "text-[var(--color-primary)]" },
  { id: 3, title: "Active Alerts", value: "—", subtitle: "Require attention", fi: "fi fi-br-info", lucide: Info, textColorClass: "text-[var(--color-danger)]" },
  { id: 4, title: "Active Cameras", value: "—", totalValue: "—", fi: "fi fi-rr-check-circle", lucide: CheckCircle2, textColorClass: "text-[var(--color-success)]" },
  { id: 5, title: "Resolved Alerts", value: "—", subtitle: "Successfully handled", fi: "fi fi-br-check-circle", lucide: CheckCircle2, textColorClass: "text-[var(--color-success)]" },
  { id: 6, title: "Inactive Cameras", value: "—", fi: "fi fi-rr-cross-circle", lucide: XCircle, textColorClass: "text-[var(--color-danger)]" },
  { id: 7, title: "Critical Alerts", value: "—", subtitle: "High priority", fi: "fi fi-br-triangle-warning", lucide: AlertTriangle, textColorClass: "text-[var(--color-danger)]" },
  { id: 8, title: "Avg. Camera Health", value: "— %", fi: "fi fi-br-circle-heart", lucide: Heart, textColorClass: "text-[var(--color-warning)]" },
];

/* ---------------------- สร้าง props พื้นฐานจาก meta ---------------------- */
const baseById = (id: number) => {
  const b = summaryCardsBase.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown card id=${id}`);
  return b;
};

const baseToProps = (b: SummaryCardBase) =>
({
  id: b.id,
  title: b.title,
  textColorClass: b.textColorClass,
  IconComponent:
    ICON_SET === "lucide"
      ? React.createElement(b.lucide, { className: "h-[30px] w-[30px]" })
      : <i className={`${b.fi} text-[30px] leading-none`} />,
} satisfies Omit<StatusCardProps, "value">);

/* --------------------------- fetch helper hook ---------------------------- */
function useFetchJson<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(url, { cache: "no-store", signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled && e?.name !== "AbortError") setError(e?.message ?? "fetch error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [url]);

  return { data, loading, error };
}

/* -------------------------- Summary Context/Provider ---------------------- */
const SummaryCtx = React.createContext<{
  data: CameraStatus | null;
  loading: boolean;
  error: string;
}>({ data: null, loading: true, error: "" });

export function SummaryProvider({
  children,
  path = `/api/cameras/status`, // ← ใช้ “path เดียว” สำหรับทุกการ์ด
}: { children: React.ReactNode; path?: string }) {
  const { data, loading, error } = useFetchJson<CameraStatus>(path);
  return (
    <SummaryCtx.Provider value={{ data, loading, error }}>
      {children}
    </SummaryCtx.Provider>
  );
}

function useSummary() {
  return React.useContext(SummaryCtx);
}

/* -------------------- Generic MetricCard (no per-card path) --------------- */
type Selector = (s: CameraStatus) => { value: string; totalValue?: string; subtitle?: string };

function MetricCard({
  baseId,
  select,
}: {
  baseId: number;
  select: Selector;
}) {
  const base = baseById(baseId);
  const { data, loading, error } = useSummary();

  if (loading) return <StatusSkeleton />;
  if (error || !data) {
    return <StatusCard {...baseToProps(base)} value="—" subtitle="Failed to load" />;
  }

  const picked = select(data);
  return (
    <StatusCard
      {...baseToProps(base)}
      value={picked.value}
      totalValue={picked.totalValue}
      subtitle={picked.subtitle ?? base.subtitle}
    />
  );
}

/* ---------------------- Export: การ์ดแต่ละใบ (ใช้ path เดียว) ------------ */
// export const TotalAlertsCard = () => (
//   <MetricCard
//     baseId={1}
//     select={(s) => ({ value: String(s.alerts_total), subtitle: s.last7d_label ?? "Last 7 days" })}
//   />
// );

export const TotalCamerasCard = () => (
  <MetricCard
    baseId={2}
    select={(s) => ({ value: String(s.total) })}
  />
);

// export const ActiveAlertsCard = () => (
//   <MetricCard
//     baseId={3}
//     select={(s) => ({ value: String(s.alerts_active), subtitle: "Require attention" })}
//   />
// );

export const ActiveCamerasCard = () => (
  <MetricCard
    baseId={4}
    select={(s) => {
      const active = s.active;
      // const total = s.uptime?.total ?? s.cameras_total;
      // return { value: String(active), totalValue: String(total) };
      return { value: String(active) };
    }}
  />
);

// export const ResolvedAlertsCard = () => (
//   <MetricCard
//     baseId={5}
//     select={(s) => ({ value: String(s.alerts_resolved), subtitle: "Successfully handled" })}
//   />
// );

export const InactiveCamerasCard = () => (
  <MetricCard
    baseId={6}
    select={(s) => ({ value: String(s.inactive) })}
  />
);

// export const CriticalAlertsCard = () => (
//   <MetricCard
//     baseId={7}
//     select={(s) => ({ value: String(s.alerts_critical), subtitle: "High priority" })}
//   />
// );

export const AvgCameraHealthCard = () => (
  <MetricCard
    baseId={8}
    select={(s) => ({ value: `${Math.round(s.avg_health)} %` })}
  />
);

/* ---------------------- ตัวอย่างการใช้งานในหน้า Dashboard --------------- */
// ใช้ครอบบริเวณที่มีการ์ดทั้งหมด เพื่อให้ fetch แค่ครั้งเดียว
export function DashboardSummaryCameraSection() {
  return (
    <SummaryProvider /* path={`${base}/api/status`} (ค่าเริ่มต้นแล้ว) */>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        <TotalCamerasCard />
        <ActiveCamerasCard />
        <InactiveCamerasCard />
        <AvgCameraHealthCard />
      </div>
    </SummaryProvider>
  );
}

export function DashboardSummaryAlertSection() {
  return (
    <SummaryProvider /* path={`${base}/api/status`} (ค่าเริ่มต้นแล้ว) */>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {/* <TotalAlertsCard />
        <ActiveAlertsCard />
        <ResolvedAlertsCard />
        <CriticalAlertsCard /> */}
      </div>
    </SummaryProvider>
  );
}