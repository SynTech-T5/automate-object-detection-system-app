"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * รีเฟรชเฉพาะข้อมูล (RSC) และล้างฟิลเตอร์ q/status/location/type ออกจาก URL
 * - คงค่า view เดิมไว้ (ถ้าอยากล้างด้วย ให้ uncomment บรรทัด sp.delete("view"))
 */
export default function RefreshButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);

    // ทำสำเนา query แล้วลบตัวกรอง
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("q");
    sp.delete("status");
    sp.delete("location");
    sp.delete("type");
    // ถ้าอยากล้าง view ด้วย: sp.delete("view");

    const qs = sp.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;

    // 1) อัปเดต URL ให้สะอาด (โดยไม่รีหน้า)
    router.replace(href, { scroll: false });

    // 2) รีเฟรชเฉพาะข้อมูลจาก Server Components
    router.refresh();

    // แสดงสปินสักครู่ให้ผู้ใช้รู้ว่ากำลังโหลด
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <Button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin text-white" : ""}`} />
      {loading ? "Refreshing..." : "Refresh"}
    </Button>
  );
}