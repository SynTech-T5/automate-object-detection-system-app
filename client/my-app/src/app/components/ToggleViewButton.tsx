// app/components/ToggleViewButton.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

type ViewMode = "grid" | "list";

export default function ToggleViewButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = (searchParams.get("view") as ViewMode) || "grid";

  const href = useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    if (view === "grid") sp.set("view", "list");
    else sp.delete("view"); // กลับเป็น grid แล้วลบ param ให้ URL สวย
    return `${pathname}?${sp.toString()}`;
  }, [pathname, searchParams, view]);

  const toggle = () => router.replace(href); // จะเกิด RSC navigation → ใช้ loading.tsx

  return (
    <Button
      type="button"
      onClick={toggle}
      className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
    >
      {view === "grid" ? (
        <>
          <List className="w-4 h-4 mr-2" />
          List View
        </>
      ) : (
        <>
          <LayoutGrid className="w-4 h-4 mr-2" />
          Grid View
        </>
      )}
    </Button>
  );
}