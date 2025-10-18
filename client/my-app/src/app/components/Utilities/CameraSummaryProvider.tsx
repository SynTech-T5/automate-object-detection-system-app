"use client";

import React from "react";
import type { Camera } from "@/app/models/cameras.model";

export interface CameraSummary {
  total: number;
  active: number;
  inactive: number;
  repair: number;
}

interface SummaryCtxValue {
  data: CameraSummary | null;
}

const CameraSummaryCtx = React.createContext<SummaryCtxValue>({
  data: null,
});

export const useCameraSummary = () => React.useContext(CameraSummaryCtx);

/** เดาชื่อฟิลด์ที่สื่อ “ซ่อม/ปิดซ่อม/maintenance” ให้ครอบคลุมเคสที่เจอบ่อย */
function isRepairing(c: Camera): boolean {
  // ปรับให้ครอบคลุมหลายชื่อฟิลด์ที่อาจมีในโมเดล
  const any = c as any;
  return Boolean(
    any?.repair ||
      any?.is_repair ||
      any?.in_repair ||
      any?.maintenance ||
      any?.is_maintenance ||
      any?.camera_repair ||
      any?.camera_repair_status
  );
}

/** แปลง boolean -> active/inactive (ตามที่ใช้ในโค้ดคุณ) */
function isActive(c: Camera): boolean {
  // โค้ดเดิมใช้ c.camera_status เป็น boolean
  return Boolean((c as any)?.camera_status);
}

export function CameraSummaryProvider({
  cameras,
  children,
}: {
  cameras: Camera[];
  children: React.ReactNode;
}) {
  const summary = React.useMemo<CameraSummary>(() => {
    const total = cameras.length;
    let active = 0;
    let inactive = 0;
    let repair = 0;

    for (const c of cameras) {
      const a = isActive(c);
      if (a) active += 1;
      else inactive += 1;

      if (isRepairing(c)) repair += 1;
    }

    return { total, active, inactive, repair };
  }, [cameras]);

  return (
    <CameraSummaryCtx.Provider value={{ data: summary }}>
      {children}
    </CameraSummaryCtx.Provider>
  );
}