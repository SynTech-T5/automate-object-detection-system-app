"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CamPick = { id: number | string; name: string; location?: string };

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
      {label ? (
        <Label className="text-xs text-[var(--color-primary)]">{label}</Label>
      ) : null}
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
  eventOptions: string[];
}) {
  const { searchParams, setParam, setMany } = useQueryParam();

  const severityValue = searchParams.get("severity");
  const statusValue = searchParams.get("status");
  const eventValue = searchParams.get("event");
  const cameraValue = searchParams.get("camera");
  const fromValue = searchParams.get("from") ?? "";
  const toValue = searchParams.get("to") ?? "";

  // ====== Fetch cameras from /api/alerts (คงเดิม) ======
  const [cams, setCams] = useState<CamPick[]>([]);
  const [camLoading, setCamLoading] = useState(false);
  const [camErr, setCamErr] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    setCamLoading(true);
    fetch("/api/alerts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: any[]) => {
        if (!mounted) return;
        const map = new Map<string, CamPick>();
        for (const al of Array.isArray(data) ? data : []) {
          const camId = al?.camera?.id ?? al?.cam_id ?? al?.camera_id;
          const camName =
            al?.camera?.name ??
            al?.cam_name ??
            al?.camera_name ??
            (camId != null ? `Camera ${camId}` : null);
          const locName =
            al?.camera?.location?.name ??
            al?.location?.name ??
            al?.loc_name ??
            (typeof al?.camera?.location === "string"
              ? al?.camera?.location
              : null);
          if (camId == null || !camName) continue;
          const key = String(camId);
          if (!map.has(key))
            map.set(key, {
              id: camId,
              name: camName,
              location: locName ?? undefined,
            });
        }
        const list = Array.from(map.values()).sort((a, b) =>
          String(a.name).localeCompare(String(b.name))
        );
        setCams(list);
      })
      .catch(
        (e) => mounted && setCamErr(e?.message || "Failed to load cameras")
      )
      .finally(() => mounted && setCamLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const hasAny =
    !!severityValue ||
    !!statusValue ||
    !!eventValue ||
    !!cameraValue ||
    !!fromValue ||
    !!toValue;

  return (
    <div className="w-full">
      <div className="grid gap-2 grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] w-full items-stretch">
        {/* Severity (ค่าคงตัว) */}
        <div className="w-full">
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
        </div>

        {/* Status (ค่าคงตัว) */}
        <div className="w-full">
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
        </div>

        {/* Camera (dynamic) */}
        <div className="w-full">
          <Field
            placeholder="All Cameras"
            value={cameraValue}
            onChange={(v) => setParam("camera", v === "All" ? null : v)}
          >
            <SelectItem value="All">All Cameras</SelectItem>
            {camLoading ? (
              <SelectItem value="__loading" disabled>
                Loading…
              </SelectItem>
            ) : camErr ? (
              <SelectItem value="__error" disabled>
                Failed to load
              </SelectItem>
            ) : (
              cams.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.name} <span className="opacity-60">#{String(c.id)}</span>
                </SelectItem>
              ))
            )}
          </Field>
        </div>

        {/* Event Types (ยังคง dynamic) */}
        <div className="w-full">
          <Field
            placeholder="All Event Types"
            value={eventValue}
            onChange={(v) => setParam("event", v === "All" ? null : v)}
          >
            <SelectItem value="All">All Event Types</SelectItem>
            {eventOptions.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </Field>
        </div>

        {/* Date range */}
        <div className="w-full">
          <div
            className="grid grid-cols-[1fr_16px_1fr] items-center gap-2
                           rounded-md border border-[var(--color-primary)] px-2 py-1.5"
          >
            <input
              type={fromValue ? "date" : "text"}
              value={fromValue}
              onFocus={(e) => (e.currentTarget.type = "date")}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.type = "text";
              }}
              onChange={(e) => setParam("from", e.target.value || null)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
              placeholder="Start date"
            />
            <span className="text-[var(--color-primary)] text-sm text-center">
              →
            </span>
            <input
              type={toValue ? "date" : "text"}
              value={toValue}
              onFocus={(e) => (e.currentTarget.type = "date")}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.type = "text";
              }}
              onChange={(e) => setParam("to", e.target.value || null)}
              className="w-full bg-transparent outline-none text-xs sm:text-sm"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Reset */}
        <div className="w-full lg:w-auto flex lg:justify-end items-center">
          <Button
            type="button"
            variant="ghost"
            className="text-[var(--color-primary)] border border-[var(--color-primary)]
                           px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                           hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]"
            disabled={!hasAny}
            onClick={() =>
              setMany({
                severity: null,
                status: null,
                camera: null,
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