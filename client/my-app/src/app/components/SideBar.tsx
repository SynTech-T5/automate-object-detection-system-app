"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GaugeCircle,
  Video,
  Bell,
  BarChart3,
  FileText,
  Settings as Cog,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useUI } from "./ui-provider";

/** hook: ตรวจขนาดจอ */
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

type Item = { label: string; href: string; icon?: LucideIcon; iconUrl?: string };

const ITEMS: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: GaugeCircle },
  { label: "Cameras", href: "/cameras", icon: Video },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Cog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useUI();          // ⬅️ ใช้ปิดเมื่อคลิก
  const isMobile = useMediaQuery("(max-width: 767px)");

  const mobileOpen = isMobile && !collapsed;            // มือถือ + เปิดอยู่
  const desktopW = collapsed ? "w-[64px]" : "w-[260px]";

  // ป้องกัน body scroll เวลา overlay เปิด
  React.useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  // คลาสตำแหน่งของ aside
  const positionClass = mobileOpen
    ? // มือถือเปิด: overlay ทับ content ทั้งหมด (ไม่ทับ header สูง ~56px)
      "fixed inset-x-0 top-14 bottom-0 z-50 w-full shadow-xl"
    : // ปกติ/เดสก์ท็อป: แปะใต้ header และเลื่อนตามหน้า
      "sticky top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] " + desktopW;

  // ถ้ามือถือและพับอยู่ → ไม่ต้องแสดงเลย
  if (isMobile && collapsed) return null;

  return (
    <>
      {/* Backdrop scrim (เฉพาะมือถือที่เปิดอยู่) */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <aside
        className={`${positionClass} shrink-0 transition-[width] duration-200 ease-in-out`}
        style={{ background: "var(--color-white)" }}
      >
        <nav className="mt-2 flex flex-col gap-1 px-2">
          {ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (isMobile) setCollapsed(true); }}  // ปิดหลังเลือกเมนู
                className={[
                  "group relative flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors",
                  isActive
                    ? "bg-[color:var(--color-primary-bg)]"
                    : "hover:bg-[color:var(--color-primary-bg)]",
                ].join(" ")}
              >
                {/* Icon */}
                <span className="flex h-9 w-9 items-center justify-center rounded-xl">
                  {item.icon ? (
                    <item.icon
                      size={20}
                      className={[
                        "transition-colors",
                        isActive
                          ? "text-[color:var(--color-primary)]"
                          : "text-[color:var(--color-black)] group-hover:text-[color:var(--color-primary)]",
                      ].join(" ")}
                    />
                  ) : item.iconUrl ? (
                    <Image
                      src={item.iconUrl}
                      alt={item.label}
                      width={20}
                      height={20}
                      className={[
                        "transition-opacity",
                        isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                      ].join(" ")}
                    />
                  ) : null}
                </span>

                {/* Label (ซ่อนเมื่อพับบน desktop เท่านั้น) */}
                {(!collapsed || isMobile) && (
                  <span
                    className={[
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "text-[color:var(--color-primary)]"
                        : "text-[color:var(--color-black)] group-hover:text-[color:var(--color-primary)]",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                )}

                {/* Tooltip ใช้เฉพาะ desktop โหมดพับ */}
                {!isMobile && collapsed && (
                  <span
                    className="pointer-events-none absolute left-[60px] top-1/2 -translate-y-1/2 rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    role="tooltip"
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}