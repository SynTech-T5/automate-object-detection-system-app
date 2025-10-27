"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ปุ่ม Refresh สำหรับ AlertView
 * - รองรับ callback onClick() เพื่อ refetch ข้อมูล
 * - แสดง animation ตอนโหลด และเปลี่ยนข้อความเป็น "Refreshing..."
 */
export default function RefreshAlertsButton({
  onClick,
  label = "Refresh",
}: {
  onClick?: () => Promise<void> | void;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    try {
      setLoading(true);
      await onClick?.();
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] 
                 px-4 py-2 rounded-md disabled:opacity-50 transition"
    >
      <RotateCw
        className={`w-4 h-4 mr-2 ${loading ? "animate-spin text-white" : ""}`}
      />
      {loading ? "Refreshing..." : label}
    </Button>
  );
}