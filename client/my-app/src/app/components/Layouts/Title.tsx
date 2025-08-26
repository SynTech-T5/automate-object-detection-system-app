"use client";

import { usePathname } from "next/navigation";

type Item = {
  label: string;
  href: string;
  title?: string;
  description?: string;
};

const ITEMS: Item[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    title: "Dashboard",
    description: "Overview of system health and quick stats",
  },
  {
    label: "Cameras",
    href: "/cameras",
    title: "Camera Management",
    description: "Manage and monitor all security cameras in the system",
  },
  {
    label: "Alerts",
    href: "/alerts",
    title: "Security Alerts",
    description: "Manage and monitor all security alerts in the system",
  },
  {
    label: "Analytics",
    href: "/analytics",
    title: "Analytics",
    description: "Insights, trends, and performance metrics",
  },
  {
    label: "Reports",
    href: "/reports",
    title: "Reports",
    description: "Generate and download scheduled or ad-hoc reports",
  },
  {
    label: "Settings",
    href: "/settings",
    title: "Settings",
    description: "Configure system preferences and access control",
  },
];

function findItemByPath(pathname: string): Item | null {
  const exact = ITEMS.find((it) => it.href === pathname);
  if (exact) return exact;

  const nested = ITEMS.find(
    (it) => pathname !== "/" && pathname.startsWith(it.href + "/")
  );
  return nested ?? null;
}

export default function Title() {
  const pathname = usePathname();
  const current = findItemByPath(pathname);

  const title = current?.title ?? "Home";
  const description =
    current?.description ??
    (current
      ? `Manage and monitor all ${current.label.toLowerCase()} in the system`
      : "Welcome to the system overview");

  return (
    <div className="space-y-2">
      {/* breadcrumb แบบโชว์ path ปัจจุบัน */}
      {current && (
        <nav aria-label="breadcrumb" className="text-sm font-medium">
          <ol className="flex items-center space-x-1 text-gray-600">
            <li className="text-[var(--color-primary)]">{current.label}</li>
          </ol>
        </nav>
      )}

      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}