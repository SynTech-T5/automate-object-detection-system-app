// app/components/Alerts/AlertTable.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, CheckCircle2, XCircle, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* -------------------------------------------------------------------------- */
/*                                SEVERITY TAGS                               */
/* -------------------------------------------------------------------------- */
const SEVERITY_STYLES = {
  critical: { pill: "bg-rose-50 text-rose-700 ring-rose-200", Icon: Icons.TriangleAlert },
  high:     { pill: "bg-orange-50 text-orange-700 ring-orange-200", Icon: Icons.CircleAlert },
  medium:   { pill: "bg-yellow-50 text-yellow-700 ring-yellow-200", Icon: Icons.Minus },
  low:      { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: Icons.ArrowDown },
  default:  { pill: "bg-slate-50 text-slate-700 ring-slate-200", Icon: Icons.CircleAlert },
} as const;

function SeverityBadge({ value }: { value?: string }) {
  const key = (value ?? "").trim().toLowerCase() as keyof typeof SEVERITY_STYLES;
  const { pill, Icon } = SEVERITY_STYLES[key] ?? SEVERITY_STYLES.default;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 STATUS TAGS                                */
/* -------------------------------------------------------------------------- */
const STATUS_STYLES = {
  active:    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  resolved:  "bg-sky-50 text-sky-700 ring-sky-200",
  dismissed: "bg-rose-50 text-rose-700 ring-rose-200",
  default:   "bg-slate-50 text-slate-700 ring-slate-200",
} as const;

function StatusBadge({ value }: { value?: string }) {
  const key = (value ?? "").trim().toLowerCase() as keyof typeof STATUS_STYLES;
  const pill = STATUS_STYLES[key] ?? STATUS_STYLES.default;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
      <span className="capitalize">{value ?? "Unknown"}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 TYPES + UTILS                              */
/* -------------------------------------------------------------------------- */
export type Alert = {
  id: number;
  severity: string;
  create_date: string;
  create_time: string;
  camera: { name: string; location: { name: string } };
  event: { name: string; icon?: string };
  status: string;
};

function iconFromName(name?: string) {
  if (!name) return Icons.Bell;
  const pascal = name
    .toString()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  return ((Icons as any)[pascal] ?? Icons.Bell) as React.ComponentType<LucideProps>;
}

/* -------------------------------------------------------------------------- */
/*                         MINIMAL ICON BUTTONS (GHOST→FULL)                  */
/* -------------------------------------------------------------------------- */
function IconAction({
  label,
  children,
  variant = "primary", // primary | success | danger
  onClick,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger";
  onClick?: () => void;
  className?: string;
}) {
  const palette =
    variant === "success"
      ? {
          border: "border-[var(--color-success)]",
          text: "text-[var(--color-success)]",
          hoverBg: "hover:bg-[var(--color-success)]",
          focusRing: "focus:ring-[var(--color-success)]",
        }
      : variant === "danger"
      ? {
          border: "border-[var(--color-danger)]",
          text: "text-[var(--color-danger)]",
          hoverBg: "hover:bg-[var(--color-danger)]",
          focusRing: "focus:ring-[var(--color-danger)]",
        }
      : {
          border: "border-[var(--color-primary)]",
          text: "text-[var(--color-primary)]",
          hoverBg: "hover:bg-[var(--color-primary)]",
          focusRing: "focus:ring-[var(--color-primary)]",
        };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={[
              // shape/size
              "inline-flex items-center justify-center h-8 w-8 rounded-full",
              // ghost base
              "bg-transparent",
              "border",
              palette.border,
              palette.text,
              // hover → full
              palette.hoverBg,
              "hover:text-white",
              "hover:border-transparent",
              // interaction
              "transition",
              "focus:outline-none",
              "focus:ring-2 focus:ring-offset-2",
              palette.focusRing,
              className,
            ].join(" ")}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ActionBar({
  status,
  onView,
  onResolve,
  onDismiss,
}: {
  status: string;
  onView?: () => void;
  onResolve?: () => void;
  onDismiss?: () => void;
}) {
  const isActive = (status ?? "").trim().toLowerCase() === "active";

  return (
    <div className="flex items-center gap-1.5">
      {/* View = primary */}
      <IconAction label="View" variant="primary" onClick={onView}>
        <Eye className="h-[16px] w-[16px]" aria-hidden="true" />
      </IconAction>

      {isActive && (
        <>
          {/* Resolve = success (green) */}
          <IconAction label="Resolve" variant="success" onClick={onResolve}>
            <CheckCircle2 className="h-[16px] w-[16px]" aria-hidden="true" />
          </IconAction>

          {/* Dismiss = danger (red) */}
          <IconAction label="Dismiss" variant="danger" onClick={onDismiss}>
            <XCircle className="h-[16px] w-[16px]" aria-hidden="true" />
          </IconAction>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 MAIN TABLE                                 */
/* -------------------------------------------------------------------------- */
type SortKey =
  | "severity"
  | "id"
  | "timestamp"
  | "camera"
  | "event"
  | "location"
  | "status";

type SortOrder = "asc" | "desc" | null;

export default function AlertTable({ alerts }: { alerts: Alert[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") setSortOrder(null);
      else setSortOrder("asc");
    }
  };

  const getComparable = (a: Alert, key: SortKey) => {
    switch (key) {
      case "timestamp": return new Date(`${a.create_date} ${a.create_time}`).getTime();
      case "camera":    return (a.camera?.name ?? "").toLowerCase();
      case "event":     return (a.event?.name ?? "").toLowerCase();
      case "location":  return (a.camera?.location?.name ?? "").toLowerCase();
      case "status":    return (a.status ?? "").toLowerCase();
      case "severity":  return (a.severity ?? "").toLowerCase();
      case "id":
      default:          return a.id;
    }
  };

  const sortedAlerts = useMemo(() => {
    if (!sortKey || !sortOrder) return alerts;
    return [...alerts].sort((a, b) => {
      const A = getComparable(a, sortKey);
      const B = getComparable(b, sortKey);
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [alerts, sortKey, sortOrder]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc")  return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "desc") return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  if (!alerts?.length) {
    return <div className="text-sm text-gray-500">No alerts to display.</div>;
  }

  return (
    <Table className="table-auto w-full">
      <TableHeader>
        <TableRow className="border-b border-[var(--color-primary)]">
          {[
            { key: "severity", label: "Severity" },
            { key: "id", label: "Alert ID" },
            { key: "timestamp", label: "Timestamp" },
            { key: "camera", label: "Camera" },
            { key: "event", label: "Event Type" },
            { key: "location", label: "Location" },
            { key: "status", label: "Status" },
          ].map(({ key, label }) => (
            <TableHead
              key={key}
              onClick={() => handleSort(key as SortKey)}
              className="cursor-pointer select-none text-[var(--color-primary)]"
            >
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>{label}</span>
                {renderSortIcon(key as SortKey)}
              </div>
            </TableHead>
          ))}

          <TableHead className="text-[var(--color-primary)]">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {sortedAlerts.map((alr) => {
          const EventIcon = iconFromName(alr.event?.icon);
          const alrCode = `ALT${String(alr.id).padStart(3, "0")}`;
          return (
            <TableRow key={alr.id}>
              <TableCell><SeverityBadge value={alr.severity} /></TableCell>
              <TableCell>{alrCode}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icons.Clock3 className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>{alr.create_date} {alr.create_time}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icons.Camera className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>{alr.camera.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <EventIcon className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>{alr.event.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>{alr.camera.location.name}</span>
                </div>
              </TableCell>
              <TableCell><StatusBadge value={alr.status} /></TableCell>

              <TableCell className="whitespace-nowrap">
                <ActionBar
                  status={alr.status}
                  onView={() => console.log("view", alr.id)}
                  onResolve={() => console.log("resolve", alr.id)}
                  onDismiss={() => console.log("dismiss", alr.id)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}