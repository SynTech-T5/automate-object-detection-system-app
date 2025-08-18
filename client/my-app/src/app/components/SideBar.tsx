"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GaugeCircle,
  Video,
  Bell,
  BarChart3,
  FileText,
  Settings as Cog,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

/** Hook: media query */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setMatches("matches" in e ? e.matches : (e as MediaQueryList).matches);
    setMatches(mql.matches);
    mql.addEventListener?.("change", onChange as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener?.("change", onChange as (e: MediaQueryListEvent) => void);
  }, [query]);
  return matches;
}

type Item = {
  label: string;
  href: string;
  icon?: LucideIcon; // lucide-react
  iconUrl?: string;  // flaticon url
};

const ITEMS: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: GaugeCircle },
  { label: "Cameras", href: "/cameras", icon: Video },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Cog },
];

const c = {
  bg: "var(--color-bg)",
  white: "var(--color-white)",
  primary: "var(--color-primary)",
  primaryBg: "var(--color-primary-bg)",
  gray: "var(--color-softGray, #8b8b8b)",
  text: "var(--color-black)",
};

export default function Sidebar() {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 767px)");

  // พับ/ขยาย + จำสถานะ
  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved != null) setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const w = collapsed ? "w-[64px]" : "w-[260px]";
  const hiddenOnMobileWhenCollapsed = isMobile && collapsed ? "hidden" : "block";

  return (
    <aside
      className={`h-screen sticky top-0 ${w} shrink-0 transition-[width] duration-200 ease-in-out ${hiddenOnMobileWhenCollapsed}`}
      style={{ background: c.white, borderRight: "1px solid #eef0f3" }}
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        {!collapsed ? (
          <div className="font-semibold tracking-wide text-[15px]">AODS</div>
        ) : (
          <div className="h-6" />
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl border px-2 py-1 hover:bg-gray-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex flex-col gap-1 px-2">
        {ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
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

              {/* Label (ซ่อนถ้า collapse) */}
              {!collapsed && (
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

              {/* Tooltip ตอนพับ */}
              {collapsed && (
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
  );
}