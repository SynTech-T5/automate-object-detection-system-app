"use client";

import React from "react";
import { Video, CheckCircle2, XCircle, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ----------------------------- ENV / CONSTANTS ---------------------------- */
const API_BASE  = process.env.NEXT_PUBLIC_APP_URL ?? "";
const API_TOKEN = process.env.NEXT_PUBLIC_TOKEN   ?? "";

/* ---------------------------------- Types --------------------------------- */
export interface CameraStatus {
  total: number;
  active: number;
  inactive: number;
  repair: number;
}

/** ตัวกรองที่อยากส่งไป summary API */
export type CameraSummaryQuery = {
  search?: string;
  status?: "Active" | "Inactive";
  location?: string;     // ชื่อหรือคำค้น
  type?: string;         // ชื่อประเภท
};

type ApiCameraSummary = {
  message: string;
  data?: Array<{ total: number; active: number; inactive: number; total_repair: number }>;
};

interface StatusCardProps {
  id: number;
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  IconComponent: React.ReactNode;
}

interface SummaryCardMeta {
  id: number;
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  lucide: LucideIcon;
}

/* ----------------------------- Utilities ---------------------------------- */
const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-md border border-gray-100 min-h-[120px] flex";

function buildQueryString(q?: CameraSummaryQuery) {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.search)   p.set("search", q.search);
  if (q.status)   p.set("status", q.status);
  if (q.location && q.location !== "All") p.set("location", q.location);
  if (q.type && q.type !== "All")         p.set("type", q.type);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function buildSummaryPath(basePath: string, query?: CameraSummaryQuery) {
  return `${basePath}${buildQueryString(query)}`;
}

/** ช่วยคำนวณสรุปจากรายการกล้องที่ “ถูกกรองแล้ว” */
export function summarizeCameras<T extends { camera_status?: boolean; maintenance_type?: string }>(
  arr: T[]
): CameraStatus {
  const total = arr.length;
  const active = arr.reduce((n, c) => n + (c.camera_status ? 1 : 0), 0);
  const inactive = total - active;
  const repair = arr.filter((c) => (c.maintenance_type ?? "").toLowerCase() === "repair").length;
  return { total, active, inactive, repair };
}

/* --------------------------------- Card ----------------------------------- */
const StatusCard: React.FC<StatusCardProps> = ({
  title, value, totalValue, subtitle, IconComponent, textColorClass,
}) => {
  return (
    <div className={cardBase}>
      <div className="flex flex-1 flex-col justify-center items-start text-left px-[20px] sm:px-[24px] py-[20px] sm:py-[22px]">
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
          <p className="text-[12px] font-normal text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

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

/* -------------------------- Cards Meta (เฉพาะ Camera) --------------------- */
const cameraCardsMeta: SummaryCardMeta[] = [
  { id: 2, title: "Total Cameras",    value: "—", lucide: Video,        textColorClass: "text-[var(--color-primary)]" },
  { id: 4, title: "Active Cameras",   value: "—", lucide: CheckCircle2, textColorClass: "text-[var(--color-success)]" },
  { id: 6, title: "Inactive Cameras", value: "—", lucide: XCircle,      textColorClass: "text-[var(--color-danger)]" },
  { id: 8, title: "Repair Cameras",   value: "—", lucide: Wrench,       textColorClass: "text-[#C00008]" },
];

const metaById = (id: number) => {
  const b = cameraCardsMeta.find((x) => x.id === id);
  if (!b) throw new Error(`Unknown card id=${id}`);
  return b;
};

const metaToProps = (b: SummaryCardMeta) =>
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
    if (!url) {
      setData(null);
      setLoading(false);
      setError("");
      return;
    }

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
  }, [url, JSON.stringify(init)]);

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
  /** endpoint เช่น "/api/cameras/summary" */
  path?: string;
  /** ส่ง query filters เพื่อ build เป็น query string ไปกับ path */
  query?: CameraSummaryQuery;
};

const CameraSummaryCtx = createSummaryCtx<CameraStatus>();
export const useCameraSummary = () => React.useContext(CameraSummaryCtx);

/** Provider ที่วางแยกได้: ใช้ initial หรือ fetch ตาม path+query */
export function CameraSummaryProvider({
  children,
  path,
  query,
  initial,
}: SummaryProviderProps<CameraStatus> & { initial?: CameraStatus }) {
  const skipFetch = !!initial;

  const url = React.useMemo(() => {
    if (!path || skipFetch) return ""; // ไม่มี path หรือมี initial → ไม่ต้อง fetch
    const full = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
    return buildSummaryPath(full, query);
  }, [path, query, skipFetch]);

  const { data: raw, loading, error } = useFetchJson<ApiCameraSummary>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  const mapped: CameraStatus | null = React.useMemo(() => {
    if (skipFetch && initial) return initial;
    const row = raw?.data?.[0];
    if (!row) return null;
    return {
      total: row.total ?? 0,
      active: row.active ?? 0,
      inactive: row.inactive ?? 0,
      repair: row.total_repair ?? 0,
    };
  }, [skipFetch, initial, raw]);

  return (
    <CameraSummaryCtx.Provider
      value={{
        data: mapped,
        loading: skipFetch ? false : loading,
        error: skipFetch ? "" : error,
      }}
    >
      {children}
    </CameraSummaryCtx.Provider>
  );
}

/* -------------------- MetricCard + Cards (Camera only) -------------------- */
type Selector<T> = (s: T) => { value: string; totalValue?: string; subtitle?: string };

function MetricCard({
  baseId,
  select,
}: {
  baseId: number;
  select: Selector<CameraStatus>;
}) {
  const base = metaById(baseId);
  const { data, loading, error } = useCameraSummary();

  if (loading) return <StatusSkeleton />;
  if (error || !data) {
    return <StatusCard {...metaToProps(base)} value="—" subtitle="Failed to load" />;
  }

  const picked = select(data);
  return (
    <StatusCard
      {...metaToProps(base)}
      value={picked.value}
      totalValue={picked.totalValue}
      subtitle={picked.subtitle ?? base.subtitle}
    />
  );
}

export const TotalCamerasCard = () => (
  <MetricCard baseId={2} select={(s) => ({ value: String(s.total) })} />
);

export const ActiveCamerasCard = () => (
  <MetricCard baseId={4} select={(s) => ({ value: String(s.active), totalValue: String(s.total) })} />
);

export const InactiveCamerasCard = () => (
  <MetricCard baseId={6} select={(s) => ({ value: String(s.inactive), totalValue: String(s.total) })} />
);

export const RepairCamerasCard = () => (
  <MetricCard baseId={8} select={(s) => ({ value: String(s.repair), totalValue: String(s.total) })} />
);

/* ------------------------- Drop-in Component ------------------------------ */
/** ใช้งานง่าย: วางการ์ดสรุป 4 ใบได้เลย */
export function DashboardSummaryCameraSection() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      <TotalCamerasCard />
      <ActiveCamerasCard />
      <InactiveCamerasCard />
      <RepairCamerasCard />
    </div>
  );
}

/** คอมโพเนนต์พร้อมใช้ วางจบในบรรทัดเดียว */
export function CameraSummary(props: {
  /** endpoint เช่น "/api/cameras/summary" */
  path?: string;
  /** ตัวกรองสำหรับสรุปบนเซิร์ฟเวอร์ */
  query?: CameraSummaryQuery;
  /** ถ้ามี initial จะไม่ fetch */
  initial?: CameraStatus;
}) {
  const { path, query, initial } = props;
  return (
    <CameraSummaryProvider path={path} query={query} initial={initial}>
      <DashboardSummaryCameraSection />
    </CameraSummaryProvider>
  );
}