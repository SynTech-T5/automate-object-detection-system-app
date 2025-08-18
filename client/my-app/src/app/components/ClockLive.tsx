"use client";
import { useEffect, useState } from "react";
import { Clock as ClockIcon } from "lucide-react";

export default function ClockLive({ timeZone = "Asia/Bangkok" }: { timeZone?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());                          // แสดงหลัง mount
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    // skeleton เล็ก ๆ กัน layout shift (จะโชว์แป๊บเดียว)
    return (
      <div className="hidden sm:flex items-center gap-2 text-gray-600">
        <ClockIcon size={16} />
        <span className="inline-block h-4 w-40 rounded bg-gray-100" />
      </div>
    );
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "2-digit", year: "numeric", timeZone,
  }).format(now);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true, timeZone,
  }).format(now);

  return (
    <div className="hidden sm:flex items-center gap-2 text-gray-600">
      <ClockIcon size={16} />
      {/* บอก React ว่า string นี้อาจไม่ตรงกับ HTML ตอนแรก */}
      <span className="whitespace-nowrap" suppressHydrationWarning>
        {datePart} <span className="mx-1">at</span> {timePart}
      </span>
    </div>
  );
}