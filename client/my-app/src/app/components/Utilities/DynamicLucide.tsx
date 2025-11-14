"use client";

import * as Icons from "lucide-react";
import type { SVGProps } from "react";

export type DynamicIconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  name?: string | null | undefined;
  fallback?: keyof typeof Icons; // ชื่อไอคอน fallback ถ้าไม่เจอ (เช่น "ShieldAlert")
};

/** แปลง string เป็น candidates ที่ lucide ใช้ได้ เช่น:
 * "triangle-alert" -> ["triangle-alert","TriangleAlert","Trianglealert","Triangle-alert"(ไม่ใช้)]
 * "triangle_alert" -> ["triangle_alert","TriangleAlert",...]
 * "triangle alert" -> ["triangle alert","TriangleAlert",...]
 */
function buildCandidates(raw?: string | null): string[] {
  if (!raw) return [];
  const s = String(raw).trim();

  // ตัด prefix ที่อาจติดมา (เช่น "lucide:triangle-alert" หรือ "lucide-triangle-alert")
  const cleaned = s.replace(/^lucide[:-]/i, "");

  const tokens = cleaned.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const pascal = tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join("");

  const candidates = [
    cleaned,                         // แบบเดิมตรงๆ (เผื่อมีคนส่ง "TriangleAlert" มาอยู่แล้ว)
    pascal,                          // PascalCase จาก token
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1), // Uppercase ตัวแรก
  ];

  // ลบซ้ำ
  return Array.from(new Set(candidates));
}

export function resolveLucideIcon(name?: string | null): React.ComponentType<SVGProps<SVGSVGElement>> | null {
  const candidates = buildCandidates(name);
  for (const c of candidates) {
    const Comp = (Icons as any)[c];
    if (Comp) return Comp;
  }
  return null;
}

export default function DynamicLucideIcon({ name, fallback = "ShieldAlert", ...rest }: DynamicIconProps) {
  const Comp = resolveLucideIcon(name) || (Icons as any)[fallback] || Icons.ShieldAlert;
  return <Comp {...rest} />;
}
