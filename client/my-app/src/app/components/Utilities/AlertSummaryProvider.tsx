// app/components/Alerts/AlertSummaryProvider.tsx
"use client";

import React from "react";
import {
  BellRing,
  CheckCircle2,
  XCircle,
  CircleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ---------------------------------- Types --------------------------------- */
export type AlertRow = {
  id: number | string;
  status?: string;    // "active" | "resolved" | "dismissed" | ...
  severity?: string;  // "critical" | "high" | "medium" | "low" | ...
  create_date?: string;
  create_time?: string;
  event?: { name?: string; icon?: string };
  camera?: { name?: string; location?: { name?: string } };
};

export interface AlertSummary {
  total: number;
  active: number;
  resolved: number;
  dismissed: number;
  // เผื่ออยากใช้ต่อ: นับตาม severity
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/* ----------------------------- Utilities ---------------------------------- */
export function summarizeAlerts<T extends { status?: string; severity?: string }>(
  rows: T[],
): AlertSummary {
  let total = 0, active = 0, resolved = 0, dismissed = 0;
  let critical = 0, high = 0, medium = 0, low = 0;

  for (const r of rows) {
    total++;
    const st = (r.status ?? "").trim().toLowerCase();
    if (st === "active") active++;
    if (st === "resolved") resolved++;
    if (st === "dismissed") dismissed++;

    const sev = (r.severity ?? "").trim().toLowerCase();
    if (sev === "critical") critical++;
    else if (sev === "high") high++;
    else if (sev === "medium") medium++;
    else if (sev === "low") low++;
  }

  return { total, active, resolved, dismissed, critical, high, medium, low };
}

/* ----------------------------- Card Common -------------------------------- */
const cardBase =
  "bg-white w-full min-w-0 rounded-[10px] shadow-md border border-gray-100 min-h-[120px] flex";

interface StatusCardProps {
  title: string;
  value: string;
  totalValue?: string;
  subtitle?: string;
  textColorClass: string;
  IconComponent: React.ReactNode;
}

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

/* --------------------------- Cards: Meta & Map ----------------------------- */
type SummaryCardMeta = {
  id: number;
  title: string;
  textColorClass: string;
  lucide: LucideIcon;
  pick: (s: AlertSummary) => { value: string; totalValue?: string; subtitle?: string };
};

const alertCardsMeta: SummaryCardMeta[] = [
  {
    id: 1,
    title: "Total Alerts",
    textColorClass: "text-[var(--color-primary)]",
    lucide: BellRing,
    pick: (s) => ({ value: String(s.total) }),
  },
  {
    id: 2,
    title: "Active Alerts",
    textColorClass: "text-[var(--color-success)]",
    lucide: CircleAlert,
    pick: (s) => ({ value: String(s.active), totalValue: String(s.total) }),
  },
  {
    id: 3,
    title: "Resolved Alerts",
    textColorClass: "text-[var(--color-info,#0ea5e9)]",
    lucide: CheckCircle2,
    pick: (s) => ({ value: String(s.resolved), totalValue: String(s.total) }),
  },
  {
    id: 4,
    title: "Dismissed Alerts",
    textColorClass: "text-[var(--color-danger)]",
    lucide: XCircle,
    pick: (s) => ({ value: String(s.dismissed), totalValue: String(s.total) }),
  },
];

const metaToProps = (m: SummaryCardMeta) => ({
  title: m.title,
  textColorClass: m.textColorClass,
  IconComponent: React.createElement(m.lucide, { className: "h-[30px] w-[30px]" }),
});

/* -------------------------- Context & Provider ----------------------------- */
interface SummaryCtxValue {
  data: AlertSummary | null;
  loading: boolean;
  error: string;
}

const AlertSummaryCtx = React.createContext<SummaryCtxValue>({
  data: null,
  loading: true,
  error: "",
});

export const useAlertSummary = () => React.useContext(AlertSummaryCtx);

/** 
 * Provider ที่คำนวณ summary จาก source ที่ส่งเข้าไป 
 * → เหมาะกับเคส "ให้ summary card มีผลตาม search filter"
 */
export function AlertSummaryProvider({
  children,
  source,
  initial,
  loading: externalLoading,
  error: externalError,
}: {
  children: React.ReactNode;
  /** แถว alert หลังกรอง (filtered) */
  source?: AlertRow[];
  /** ถ้ามี initial จะใช้แทนการคำนวณจาก source */
  initial?: AlertSummary;
  /** เผื่อรับสถานะโหลด/เออเรอร์จากภายนอก */
  loading?: boolean;
  error?: string;
}) {
  const summary = React.useMemo<AlertSummary | null>(() => {
    if (initial) return initial;
    if (!source) return null;
    return summarizeAlerts(source);
  }, [initial, source]);

  return (
    <AlertSummaryCtx.Provider
      value={{
        data: summary,
        loading: !!externalLoading,
        error: externalError ?? "",
      }}
    >
      {children}
    </AlertSummaryCtx.Provider>
  );
}

/* ----------------------------- Metric Cards ------------------------------- */
function MetricCard({ meta }: { meta: SummaryCardMeta }) {
  const { data, loading, error } = useAlertSummary();

  if (loading) return <StatusSkeleton />;
  if (error || !data) {
    return <StatusCard {...metaToProps(meta)} value="—" subtitle={error || "Failed to load"} />;
  }
  const picked = meta.pick(data);
  return (
    <StatusCard {...metaToProps(meta)} value={picked.value} totalValue={picked.totalValue} subtitle={picked.subtitle} />
  );
}

/* -------------------------- Section: 4 Cards ------------------------------- */
export function DashboardSummaryAlertSection() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {alertCardsMeta.map((m) => (
        <MetricCard key={m.id} meta={m} />
      ))}
    </div>
  );
}
