"use client";

import React from "react";
import {
  Bell, Video, Info, CheckCircle2, XCircle, AlertTriangle, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ----------------------------- ENV / CONSTANTS ---------------------------- */
const API_BASE  = process.env.NEXT_PUBLIC_APP_URL ?? "";   // e.g. https://api.example.com
const API_TOKEN = process.env.NEXT_PUBLIC_TOKEN   ?? "";   // Bearer token (public for client-side)

/* ---------------------------------- Types --------------------------------- */
interface CameraStatus {
  total: number;
  active: number;
  inactive: number;
  repair: number; // mapped from total_repair
}

interface AlertStatus {
  total: number;
  active: number;
  resolved: number;
  dismissed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface StatusCardProps {
  id: number;
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  IconComponent: React.ReactNode; // lucide icon element
}

interface SummaryCardBase {
  id: number;
  title: string;
  value: string;         // default (จะถูกแทนด้วย summary)
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  lucide: LucideIcon;    // ใช้เฉพาะ lucide
}

/* --------------------------- Shared Style (base) --------------------------- */
const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-md border border-gray-100 " +
  "min-h-[120px] flex";

/* ------------------------------- StatusCard -------------------------------- */
const StatusCard: React.FC<StatusCardProps> = ({
  id, title, value, totalValue, subtitle, IconComponent, textColorClass,
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
  { id: 1, title: "Total Alerts",    value: "—", subtitle: "Last 7 days",         lucide: Bell,          textColorClass: "text-[var(--color-primary)]" },
  { id: 2, title: "Total Cameras",   value: "—",                                   lucide: Video,         textColorClass: "text-[var(--color-primary)]" },
  { id: 3, title: "Active Alerts",   value: "—", subtitle: "Require attention",    lucide: Info,          textColorClass: "text-[var(--color-danger)]" },
  { id: 4, title: "Active Cameras",  value: "—", totalValue: "—",                  lucide: CheckCircle2,  textColorClass: "text-[var(--color-success)]" },
  { id: 5, title: "Resolved Alerts", value: "—", subtitle: "Successfully handled", lucide: CheckCircle2,  textColorClass: "text-[var(--color-success)]" },
  { id: 6, title: "Inactive Cameras",value: "—",                                   lucide: XCircle,       textColorClass: "text-[var(--color-danger)]" },
  { id: 7, title: "Critical Alerts", value: "—", subtitle: "High priority",        lucide: AlertTriangle, textColorClass: "text-[var(--color-danger)]" },
  { id: 8, title: "Repair Cameras",  value: "—",                                   lucide: Wrench,        textColorClass: "text-[#C00008]" },
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
  IconComponent: React.createElement(b.lucide, { className: "h-[30px] w-[30px]" }),
} satisfies Omit<StatusCardProps, "value">);

/* --------------------------- fetch helper hook ---------------------------- */
function useFetchJson<T>(url: string, init?: RequestInit) {
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
        const res = await fetch(url, {
          cache: "no-store",
          signal: ac.signal,
          ...(init ?? {}),
        });
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
  }, [url, JSON.stringify(init)]); // รีเฟชเมื่อ header/method เปลี่ยน

  return { data, loading, error };
}

/* -------------------------- Summary Context/Provider ---------------------- */
interface SummaryCtxValue<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

function createSummaryCtx<T>() {
  return React.createContext<SummaryCtxValue<T>>({
    data: null,
    loading: true,
    error: "",
  });
}

type SummaryProviderProps<T> = {
  children: React.ReactNode;
  path?: string;
};

/* ----------------- กล้อง: Provider (map payload + token) ------------------ */
const CameraSummaryCtx = createSummaryCtx<CameraStatus>();
export const useCameraSummary = () => React.useContext(CameraSummaryCtx);

type ApiCameraSummary = {
  message: string;
  data?: Array<{ total: number; active: number; inactive: number; total_repair: number }>;
};

export function CameraSummaryProvider({
  children, path,
}: SummaryProviderProps<CameraStatus>) {
  // สร้าง URL: รองรับ relative และ absolute
  const url = React.useMemo(() => {
    const p = path ?? "";
    return /^https?:\/\//i.test(p) ? p : `${API_BASE}${p}`;
  }, [path]);

  // แนบ Bearer token + content-type
  const { data: raw, loading, error } = useFetchJson<ApiCameraSummary>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  // map payload -> CameraStatus
  const mapped: CameraStatus | null = React.useMemo(() => {
    const row = raw?.data?.[0];
    if (!row) return null;
    return {
      total: row.total ?? 0,
      active: row.active ?? 0,
      inactive: row.inactive ?? 0,
      repair: row.total_repair ?? 0,
    };
  }, [raw]);

  return (
    <CameraSummaryCtx.Provider value={{ data: mapped, loading, error }}>
      {children}
    </CameraSummaryCtx.Provider>
  );
}

/* ----------------- Alerts: Generic provider (หากต้องการใช้ต่อ) ---------- */
const AlertSummaryCtx = createSummaryCtx<AlertStatus>();
export const useAlertSummary = () => React.useContext(AlertSummaryCtx);

function createSummaryProvider<T>(Ctx: React.Context<SummaryCtxValue<T>>) {
  return function SummaryProvider({ children, path }: SummaryProviderProps<T>) {
    // หมายเหตุ: ตรงนี้ยังไม่ใส่ token เพราะไม่ได้ระบุ requirement สำหรับ alerts
    const url = React.useMemo(() => {
      const p = path ?? "";
      return /^https?:\/\//i.test(p) ? p : `${API_BASE}${p}`;
    }, [path]);

    const { data, loading, error } = useFetchJson<T>(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return (
      <Ctx.Provider value={{ data, loading, error }}>
        {children}
      </Ctx.Provider>
    );
  };
}

export const AlertSummaryProvider = createSummaryProvider<AlertStatus>(AlertSummaryCtx);

/* -------------------- Generic MetricCard (no per-card path) --------------- */
type Selector<T> = (s: T) => { value: string; totalValue?: string; subtitle?: string };

function MetricCard<T>({
  baseId,
  select,
  useSummary,
}: {
  baseId: number;
  select: Selector<T>;
  useSummary: () => { data: T | null; loading: boolean; error: string };
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

/* ---------------------- Metric wrappers per domain ------------------------ */
function MetricCardCamera(p: { baseId: number; select: Selector<CameraStatus> }) {
  return <MetricCard<CameraStatus> baseId={p.baseId} select={p.select} useSummary={useCameraSummary} />;
}

function MetricCardAlert(p: { baseId: number; select: Selector<AlertStatus> }) {
  return <MetricCard<AlertStatus> baseId={p.baseId} select={p.select} useSummary={useAlertSummary} />;
}

/* ---------------------- Export: การ์ดแต่ละใบ (map domain) ---------------- */
// ALERT CARDS (ids: 1,3,5,7)
export const TotalAlertsCard = () => (
  <MetricCardAlert baseId={1} select={(s) => ({ value: String(s.total) })} />
);

export const ActiveAlertsCard = () => (
  <MetricCardAlert baseId={3} select={(s) => ({ value: String(s.active) })} />
);

export const ResolvedAlertsCard = () => (
  <MetricCardAlert baseId={5} select={(s) => ({ value: String(s.resolved) })} />
);

export const CriticalAlertsCard = () => (
  <MetricCardAlert baseId={7} select={(s) => ({ value: String(s.critical) })} />
);

// CAMERA CARDS (ids: 2,4,6,8)
export const TotalCamerasCard = () => (
  <MetricCardCamera baseId={2} select={(s) => ({ value: String(s.total) })} />
);

export const ActiveCamerasCard = () => (
  <MetricCardCamera baseId={4} select={(s) => ({ value: String(s.active) })} />
);

export const InactiveCamerasCard = () => (
  <MetricCardCamera baseId={6} select={(s) => ({ value: String(s.inactive) })} />
);

export const Repair = () => (
  <MetricCardCamera baseId={8} select={(s) => ({ value: String(s.repair) })} />
);

/* ---------------------- ตัวอย่างการใช้งานในหน้า Dashboard --------------- */
export function DashboardSummaryCameraSection() {
  return (
    <CameraSummaryProvider path={`/api/cameras/summary`}>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        <TotalCamerasCard />
        <ActiveCamerasCard />
        <InactiveCamerasCard />
        <Repair />
      </div>
    </CameraSummaryProvider>
  );
}

export function DashboardSummaryAlertSection() {
  return (
    <AlertSummaryProvider path={`/api/alerts/status`}>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        <TotalAlertsCard />
        <ActiveAlertsCard />
        <ResolvedAlertsCard />
        <CriticalAlertsCard />
      </div>
    </AlertSummaryProvider>
  );
}