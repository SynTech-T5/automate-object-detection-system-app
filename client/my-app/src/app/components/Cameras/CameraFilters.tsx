"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Camera as CameraIcon,
  Move,
  Scan,
  Thermometer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ---------------------- เพิ่ม/แก้ชนิดข้อมูลให้ตรง API ---------------------- */
type ApiLocation = {
  location_id: number;
  location_name: string;
  location_updated_date: string; // "2025-10-12"
  location_updated_time: string; // "19:47:51"
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  fixed: CameraIcon,
  ptz: Move,
  panoramic: Scan,
  thermal: Thermometer,
};

function getTypeIcon(typeKey?: string | null) {
  const key = (typeKey ?? "").toLowerCase();
  return TYPE_ICON[key] ?? CameraIcon;
}

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
  renderPrefix,
}: {
  label: string;
  placeholder: string;
  value?: string | null;
  onChange: (val: string) => void;
  children: React.ReactNode;
  renderPrefix?: React.ReactNode;
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
                     px-2 py-1.5 text-xs
                     sm:px-3 sm:py-2 sm:text-sm
                     md:px-3 md:py-2.5 md:text-sm"
        >
          {renderPrefix ? (
            <div className="grid grid-cols-[auto_1fr] items-center gap-2 w-full">
              <span className="inline-block h-4 w-4">{renderPrefix}</span>
              <SelectValue placeholder={placeholder} />
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="border-[var(--color-primary)]">
          {children}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function CameraFilters({
  typeOptions,
}: {
  /** รายการชนิดกล้อง ถ้าไม่ส่ง จะใช้ค่าเริ่มต้น */
  typeOptions?: string[];
}) {
  const { searchParams, setParam, setMany } = useQueryParam();

  // STATUS
  const statusValue = (() => {
    const v = searchParams.get("status");
    return v === "Active" || v === "Inactive" ? v : null;
  })();

  // LOCATION
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [locErr, setLocErr] = useState<string>("");
  const [locLoading, setLocLoading] = useState<boolean>(false);
  const locationValue = searchParams.get("location");

  /* --------------------------- ใช้ fetch แบบที่ขอ --------------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLocLoading(true);

        const r = await fetch(`/api/locations`, {
          method: "GET",
          headers: {
            // ใช้ NEXT_PUBLIC_TOKEN สำหรับ client component
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }

        // รูปแบบที่ได้: { message: string, data: ApiLocation[] }
        const payload: { message: string; data?: ApiLocation[] } = await r.json();

        if (!mounted) return;

        setLocations(Array.isArray(payload?.data) ? payload.data! : []);
        setLocErr("");
      } catch (e: any) {
        if (!mounted) return;
        setLocErr(e?.message || "Failed to load locations");
        setLocations([]);
      } finally {
        if (mounted) setLocLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------- ดึงตัวเลือกเป็นชื่อ location จาก payload.data ------------- */
  const locationOptions = useMemo(() => {
    const names = locations
      .map((it) => it?.location_name)
      .filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [locations]);

  // TYPE
  const typeValue = searchParams.get("type");
  const typeOpts =
    typeOptions && typeOptions.length > 0
      ? typeOptions
      : ["Fixed", "PTZ", "Panoramic", "Thermal"];

  // มีฟิลเตอร์อะไรถูกตั้งไว้บ้าง?
  const hasAny = Boolean(statusValue || locationValue || typeValue);

  return (
    <div className="grid gap-2 grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] w-full items-stretch">
      {/* Status */}
      <Field
        label=""
        placeholder="All status"
        value={statusValue}
        onChange={(v) => setParam("status", v === "All" ? null : v)}
      >
        <SelectItem value="All">All Status</SelectItem>
        <SelectItem value="Active">Active</SelectItem>
        <SelectItem value="Inactive">Inactive</SelectItem>
      </Field>

      {/* Location */}
      <Field
        label=""
        placeholder="All locations"
        value={locationValue}
        onChange={(v) => setParam("location", v === "All" ? null : v)}
      >
        <SelectItem value="All">All Locations</SelectItem>
        {locLoading ? (
          <SelectItem value="__loading" disabled>Loading…</SelectItem>
        ) : locErr ? (
          <SelectItem value="__error" disabled>Failed to load</SelectItem>
        ) : (
          locationOptions.map((loc) => (
            <SelectItem key={loc} value={loc.toLowerCase()}>
              {loc}
            </SelectItem>
          ))
        )}
      </Field>

      {/* Type */}
      <Field
        label=""
        placeholder="All types"
        value={typeValue}
        onChange={(v) => setParam("type", v === "All" ? null : v)}
      >
        <SelectItem value="All">All Types</SelectItem>
        {typeOpts.map((t) => {
          const value = t.toLowerCase();
          const Icon = getTypeIcon(value);
          return (
            <SelectItem key={t} value={value}>
              <span className="grid grid-cols-[auto_1fr] items-center gap-2">
                <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                <span>{t}</span>
              </span>
            </SelectItem>
          );
        })}
      </Field>

      {/* Reset */}
      <div className="flex sm:justify-end items-center">
        <Button
          type="button"
          variant="ghost"
          className="text-[var(--color-primary)] border border-[var(--color-primary)]
                     px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
                     hover:bg-[var(--color-primary)] hover:text-[var(--color-white)]"
          disabled={!hasAny}
          onClick={() =>
            setMany({
              status: null,
              location: null,
              type: null,
            })
          }
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}