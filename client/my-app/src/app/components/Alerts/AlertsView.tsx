"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AlertTable, { type Alert as TableAlert } from "./AlertTable";
import {
  AlertSummaryProvider,
  DashboardSummaryAlertSection,
} from "@/app/components/Utilities/AlertSummaryProvider";
import DistributionChart from "@/app/components/Alerts/Chart/Distribution";
import Severity from "@/app/components/Alerts/Chart/Severity";
import RefreshAlertsButton from "@/app/components/Utilities/RefreshAlertsButton";
import { Separator } from "@/components/ui/separator";

/* --------------------------- API response types --------------------------- */
type ApiAlert = {
  severity: string;        // "critical" | "high" | "medium" | "low"
  alert_id: number;
  created_at: string;      // ISO string
  description: string;
  camera_id: number;
  camera_name: string;
  event_icon?: string;     // e.g. "shield-alert"
  event_name: string;
  location_name: string;
  alert_status: string;    // "active" | "resolved" | "dismissed" | ...
  footage_id?: number;
  footage_path?: string;
  created_by?: string;
};

type ApiResponse = {
  message: string;
  data: ApiAlert[];
};

/* ------------------------------- utilities -------------------------------- */
function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function splitIsoToDateTime(iso?: string): { date: string; time: string } {
  if (!iso) return { date: "-", time: "-" };
  const d = new Date(iso);
  if (isNaN(+d)) return { date: "-", time: "-" };
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}:${ss}` };
}

function normalizeToTableAlert(a: ApiAlert): TableAlert {
  const { date, time } = splitIsoToDateTime(a.created_at);
  // รองรับทั้ง a.alert_description และ a.description
  const desc =
    // @ts-ignore (บาง API อาจส่งเป็น alert_description)
    (a as any).alert_description ??
    a.description ??
    "";

  return {
    id: a.alert_id,
    severity: (a.severity ?? "").toLowerCase(),
    create_date: date,
    create_time: time,
    // ส่งต่อไปให้ AlertTable ใช้ใน meta card
    alert_description: desc,
    camera: {
      name: a.camera_name ?? "",
      location: { name: a.location_name ?? "" },
    },
    event: { name: a.event_name ?? "", icon: a.event_icon },
    status: (a.alert_status ?? "").toLowerCase(),
  };
}

/* --------------------------------- view ----------------------------------- */
export default function AlertView() {
  const sp = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<TableAlert[]>([]);
  const [reloadTick, setReloadTick] = useState(0); // ใช้กระตุ้นให้ re-fetch

  const refetch = useCallback(async () => {
    // แยกเป็นฟังก์ชันเพื่อส่งให้ปุ่ม Refresh
    setReloadTick((x) => x + 1);
  }, []);

  // fetch /api/alerts (client)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/alerts", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Failed to load alerts (${res.status})`);
        const json: ApiResponse = await res.json();
        const rows = (json?.data ?? []).map(normalizeToTableAlert);
        setAlerts(rows);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [reloadTick]);

  // URL params (ได้จากบล็อก Search & Filter ที่อยู่บน page)
  const q = sp.get("q") ?? "";
  const severityParam = (sp.get("severity") ?? "").toLowerCase();
  const statusParam = (sp.get("status") ?? "").toLowerCase();
  const eventParam = sp.get("event") ?? "";
  const locationParam = (sp.get("location") ?? "").toLowerCase();
  const cameraParam = (sp.get("camera") ?? "").toLowerCase();
  const fromParam = sp.get("from") ?? "";
  const toParam = sp.get("to") ?? "";

  // filtering
  const filtered = useMemo(() => {
    const fromDate = fromParam ? new Date(fromParam + "T00:00:00") : null;
    const toDate = toParam ? new Date(toParam + "T23:59:59.999") : null;
    const qTokens = q.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return alerts.filter((a) => {
      if (severityParam && a.severity !== severityParam) return false;
      if (statusParam && a.status !== statusParam) return false;
      if (eventParam && !a.event.name.toLowerCase().includes(eventParam.toLowerCase())) return false;
      if (locationParam && !a.camera.location.name.toLowerCase().includes(locationParam)) return false;

      if (cameraParam) {
        const camName = a.camera.name.toLowerCase();
        if (!camName.includes(cameraParam)) return false;
      }

      const d = new Date(`${a.create_date}T${a.create_time}`);
      if (fromDate && !isNaN(+d) && d < fromDate) return false;
      if (toDate && !isNaN(+d) && d > toDate) return false;

      if (qTokens.length) {
        const blob = `${a.id} ${a.event.name} ${a.camera.name} ${a.camera.location.name} ${a.severity} ${a.status} ${(a as any).alert_description ?? ""}`
          .toLowerCase();
        for (const t of qTokens) if (!blob.includes(t)) return false;
      }
      return true;
    });
  }, [alerts, q, severityParam, statusParam, eventParam, locationParam, cameraParam, fromParam, toParam]);

  if (loading) return <div className="text-sm text-gray-500">Loading alerts…</div>;
  if (error) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-red-600">Error: {error}</span>
        <RefreshAlertsButton onClick={refetch} label="Retry" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* === Summary Section (สรุปหลังกรอง) === */}
      <AlertSummaryProvider source={filtered}>
        <DashboardSummaryAlertSection />
      </AlertSummaryProvider>

      {/* === Alert Management Card (Table + Refresh) === */}
      <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start gap-3 justify-center mb-3">
          <label
            htmlFor="alertManagement"
            className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
          >
            Alert Management
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <RefreshAlertsButton onClick={refetch} />
          </div>
        </div>

        <Separator className="bg-[var(--color-primary-bg)] my-3" />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
          <AlertTable alerts={filtered} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
          <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
            <label
              htmlFor="AlertTrends"
              className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
            >
              Alert Severity
            </label>
          </div>
          <Separator className="bg-[var(--color-primary-bg)] mb-3" />
          <Severity items={filtered} />
        </div>

        <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6 ">
          <div className="flex flex-wrap items-start gap-3 justify-center mb-3">
            <label
              htmlFor="AlertDistribution"
              className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
            >
              Alert Distribution by Event Type
            </label>
          </div>
          <Separator className="bg-[var(--color-primary-bg)] mb-3" />
          <DistributionChart items={filtered} />
        </div>
      </div>
    </div>
  );
}