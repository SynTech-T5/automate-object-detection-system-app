// app/components/Alerts/AlertFilters.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ApiLocation = {
  location_id: number;
  location_name: string;
  location_updated_date?: string;
  location_updated_time?: string;
};

function useQueryParam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function setParam(key: string, value?: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") params.delete(key);
    else params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setMany(obj: Record<string, string | null | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(obj)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { searchParams, setParam, setMany };
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  children,
}: {
  label?: string;
  placeholder: string;
  value?: string | null;
  onChange: (val: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 w-full">
      {label ? <Label className="text-xs text-[var(--color-primary)]">{label}</Label> : null}
      <Select value={value ?? "All"} onValueChange={onChange}>
        <SelectTrigger
          className="w-full rounded-md border border-[var(--color-primary)]
                     text-[var(--color-primary)]
                     focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]
                     px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm md:px-3 md:py-2.5 md:text-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-[var(--color-primary)]">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function AlertFilters({
  eventOptions,
}: {
  /** ถ้าไม่ส่งมา จะ autoload จาก /api/alerts */
  eventOptions?: string[];
}) {
  const { searchParams, setParam, setMany } = useQueryParam();

  const severityValue = searchParams.get("severity");
  const statusValue   = searchParams.get("status");
  const eventValue    = searchParams.get("event");
  const cameraValue   = searchParams.get("camera");   // cam_name
  const locationValue = searchParams.get("location"); // เก็บเป็น lower-case string
  const fromValue     = searchParams.get("from") ?? "";
  const toValue       = searchParams.get("to") ?? "";

  // ====== state ======
  const [cameraNames, setCameraNames] = useState<string[]>([]);
  const [locations, setLocations]     = useState<ApiLocation[]>([]);
  const [evOpts, setEvOpts]           = useState<string[]>([]);

  const [camsLoading, setCamsLoading] = useState(false);
  const [locLoading,  setLocLoading]  = useState(false);

  const [camsErr, setCamsErr] = useState<string>("");
  const [locErr,  setLocErr]  = useState<string>("");

  const wantAutoLoadEvents = !eventOptions || eventOptions.length === 0;

  // ---- โหลด Camera names + (optional) events จาก /api/alerts ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCamsLoading(true);
        setCamsErr("");

        const r = await fetch(`/api/alerts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json: any = await r.json();
        const arr: any[] = Array.isArray(json) ? json : (json?.data ?? []);

        const cNameSet = new Set<string>();
        const eSet     = new Set<string>();

        for (const it of arr) {
          const camName =
            it?.camera?.name ??
            it?.cam_name ??
            it?.camera_name ??
            null;
          if (camName) cNameSet.add(String(camName));

          if (wantAutoLoadEvents) {
            const eName = (it?.event_name ?? it?.event?.name ?? "").toString().trim();
            if (eName) eSet.add(eName);
          }
        }

        if (!mounted) return;
        setCameraNames(Array.from(cNameSet).sort((a, b) => a.localeCompare(b)));
        if (wantAutoLoadEvents) setEvOpts(Array.from(eSet).sort((a, b) => a.localeCompare(b)));
      } catch (e: any) {
        if (!mounted) return;
        setCamsErr(e?.message || "Failed to load alerts");
        setCameraNames([]);
        if (wantAutoLoadEvents) setEvOpts([]);
      } finally {
        if (mounted) setCamsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [wantAutoLoadEvents]);

  // ---- โหลด Locations จาก /api/locations (ตรงตามตัวอย่างกล้อง) ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLocLoading(true);
        setLocErr("");

        const r = await fetch(`/api/locations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);

        const payload: { message?: string; data?: ApiLocation[] } = await r.json();
        const rows = Array.isArray(payload?.data) ? payload.data! : [];
        if (!mounted) return;
        setLocations(rows);
      } catch (e: any) {
        if (!mounted) return;
        setLocErr(e?.message || "Failed to load locations");
        setLocations([]);
      } finally {
        if (mounted) setLocLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ---- รายชื่อ location จาก payload (ไม่ซ้ำ + เรียง) ----
  const locationOptions = useMemo(() => {
    const names = locations.map((it) => it.location_name).filter(Boolean) as string[];
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [locations]);

  const effectiveEventOptions = useMemo(
    () => (wantAutoLoadEvents ? evOpts : (eventOptions ?? [])),
    [wantAutoLoadEvents, evOpts, eventOptions]
  );

  const hasAny =
    !!severityValue || !!statusValue || !!eventValue ||
    !!cameraValue   || !!locationValue || !!fromValue || !!toValue;

  return (
    <div className="w-full">
      <div className="grid gap-2 grid-cols-1 min-[560px]:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] w-full items-stretch">
        {/* Severity */}
        <Field
          placeholder="All Severities"
          value={severityValue}
          onChange={(v) => setParam("severity", v === "All" ? null : v)}
        >
          <SelectItem value="All">All Severities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </Field>

        {/* Status */}
        <Field
          placeholder="All Statuses"
          value={statusValue}
          onChange={(v) => setParam("status", v === "All" ? null : v)}
        >
          <SelectItem value="All">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
        </Field>

        {/* Camera (dropdown by cam_name) */}
        <Field
          placeholder="All Cameras"
          value={cameraValue}
          onChange={(v) => setParam("camera", v === "All" ? null : v)}
        >
          <SelectItem value="All">All Cameras</SelectItem>
          {camsLoading ? (
            <SelectItem value="__loading" disabled>Loading…</SelectItem>
          ) : camsErr ? (
            <SelectItem value="__error" disabled>Failed to load</SelectItem>
          ) : cameraNames.length ? (
            cameraNames.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))
          ) : (
            <SelectItem value="__empty" disabled>— No cameras —</SelectItem>
          )}
        </Field>

        {/* Location (dropdown; from /api/locations) */}
        <Field
          placeholder="All Locations"
          value={locationValue}
          onChange={(v) => setParam("location", v === "All" ? null : v)}
        >
          <SelectItem value="All">All Locations</SelectItem>
          {locLoading ? (
            <SelectItem value="__loading" disabled>Loading…</SelectItem>
          ) : locErr ? (
            <SelectItem value="__error" disabled>Failed to load</SelectItem>
          ) : locationOptions.length ? (
            locationOptions.map((loc) => (
              // value เก็บเป็น lower-case เพื่อให้ AlertView เทียบ includes ได้ง่าย
              <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>
            ))
          ) : (
            <SelectItem value="__empty" disabled>— No locations —</SelectItem>
          )}
        </Field>

        {/* Event Types */}
        <Field
          placeholder="All Event Types"
          value={eventValue}
          onChange={(v) => setParam("event", v === "All" ? null : v)}
        >
          <SelectItem value="All">All Event Types</SelectItem>
          {effectiveEventOptions.map((e) => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </Field>

        {/* Date range */}
        <div className="w-full">
          <div className="grid grid-cols-[1fr_16px_1fr] items-center gap-2 rounded-md border border-[var(--color-primary)] px-2 py-1.5">
            <input
              type={fromValue ? "date" : "text"}
              value={fromValue}
              onFocus={(e) => (e.currentTarget.type = "date")}
              onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }}
              onChange={(e) => setParam("from", e.target.value || null)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
              placeholder="Start date"
            />
            <span className="text-[var(--color-primary)] text-sm text-center">→</span>
            <input
              type={toValue ? "date" : "text"}
              value={toValue}
              onFocus={(e) => (e.currentTarget.type = "date")}
              onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = "text"; }}
              onChange={(e) => setParam("to", e.target.value || null)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Reset */}
        <div className="w-full md:w-auto flex md:justify-end items-center">
          <Button
            type="button"
            variant="ghost"
            className="text-[var(--color-primary)] border border-[var(--color-primary)]
                       px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                       hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]"
            disabled={!(
              severityValue || statusValue || eventValue ||
              cameraValue   || locationValue || fromValue || toValue
            )}
            onClick={() =>
              setMany({
                severity: null,
                status: null,
                camera: null,
                location: null,
                event: null,
                from: null,
                to: null,
              })
            }
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}