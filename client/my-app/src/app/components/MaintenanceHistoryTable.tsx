"use client";

import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  MoreVertical, Wrench, RefreshCw, Hammer, ArrowUpCircle, Search, Settings, ClipboardCheck,
  ArrowUpDown, ArrowUp, ArrowDown, User
} from "lucide-react";

/* -------------------- Types -------------------- */
type MaintenanceHistory = {
  id: string;
  cameraId: number;
  date: string;       // e.g. "2025-05-15"
  type: string;
  technician: string;
  notes: string;
};

type SortKey = keyof MaintenanceHistory;
type SortOrder = "asc" | "desc" | null;

/* -------------------- Badge -------------------- */
type MaintenanceTypeBadgeProps = { type: string };

const TYPE_META: Record<string, { icon: React.ReactNode; classes: string }> = {
  "Routine Check": {
    icon: <ClipboardCheck className="w-3 h-3 mr-1" />,
    classes: "border border-blue-300 text-blue-700 bg-blue-50",
  },
  Repair: {
    icon: <Wrench className="w-3 h-3 mr-1" />,
    classes: "border border-red-300 text-red-700 bg-red-50",
  },
  Installation: {
    icon: <Hammer className="w-3 h-3 mr-1" />,
    classes: "border border-emerald-300 text-emerald-700 bg-emerald-50",
  },
  Upgrade: {
    icon: <ArrowUpCircle className="w-3 h-3 mr-1" />,
    classes: "border border-purple-300 text-purple-700 bg-purple-50",
  },
  Replacement: {
    icon: <RefreshCw className="w-3 h-3 mr-1" />,
    classes: "border border-orange-300 text-orange-700 bg-orange-50",
  },
  Inspection: {
    icon: <Search className="w-3 h-3 mr-1" />,
    classes: "border border-amber-300 text-amber-700 bg-amber-50",
  },
  Configuration: {
    icon: <Settings className="w-3 h-3 mr-1" />,
    classes: "border border-teal-300 text-teal-700 bg-teal-50",
  },
};

function MaintenanceTypeBadge({ type }: MaintenanceTypeBadgeProps) {
  const meta = TYPE_META[type] ?? {
    icon: <ClipboardCheck className="w-3 h-3 mr-1" />,
    classes: "border border-gray-300 text-gray-700 bg-gray-50",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.classes}`}>
      {meta.icon}
      {type}
    </span>
  );
}

/* -------------------- Table with Sorting -------------------- */
type Props = { records: MaintenanceHistory[] };

export default function MaintenanceHistoryTable({ records }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return <ArrowUpDown className="w-4 h-4 ml-1 inline-block" />;
    if (sortOrder === "asc") return <ArrowUp className="w-4 h-4 ml-1 inline-block" />;
    return <ArrowDown className="w-4 h-4 ml-1 inline-block" />;
  };

  const sortedRecords = useMemo(() => {
    if (!sortOrder) return records;
    const arr = [...records];
    return arr.sort((a, b) => {
      let aVal = a[sortKey] as unknown;
      let bVal = b[sortKey] as unknown;

      if (sortKey === "date") {
        const aTime = new Date(String(aVal)).getTime();
        const bTime = new Date(String(bVal)).getTime();
        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [records, sortKey, sortOrder]);

  return (
    <div className="w-full max-h-[400px] overflow-y-auto">
      <Table className="w-full table-auto">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("id")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>ID</span>
                {renderSortIcon("id")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("date")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Date</span>
                {renderSortIcon("date")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("type")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Type</span>
                {renderSortIcon("type")}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("technician")} className="cursor-pointer select-none text-[var(--color-primary)]">
              <div className="flex items-center justify-between pr-3 border-r border-[var(--color-primary)] w-full">
                <span>Technician</span>
                {renderSortIcon("technician")}
              </div>
            </TableHead>
            <TableHead className="text-[var(--color-primary)] text-[12px] text-left font-medium">
              Notes
            </TableHead>
            <TableHead className="w-[36px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedRecords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-4 text-[12px] text-gray-500 text-center">
                No maintenance records.
              </TableCell>
            </TableRow>
          ) : (
            sortedRecords.map((rec) => (
              <TableRow key={rec.id} className="border-b border-gray-200 align-top text-[12px]">
                <TableCell className="pl-0 py-3 align-top text-left font-medium">{rec.id}</TableCell>
                <TableCell className="px-2 py-3 align-top text-left font-medium">{rec.date}</TableCell>
                <TableCell className="px-2 py-3 align-top text-left font-medium">
                  <MaintenanceTypeBadge type={rec.type} />
                </TableCell>
                <TableCell className="px-2 py-3 align-top font-medium text-left">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-[var(--color-primary)]" />
                    <span>{rec.technician}</span>
                  </div>
                </TableCell>
                <TableCell className="px-2 py-3 whitespace-pre-wrap break-words align-top text-left">
                  {rec.notes}
                </TableCell>
                <TableCell className="px-2 py-3 align-top text-left">
                  <MoreVertical className="h-4 w-4 text-gray-500 cursor-pointer" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}