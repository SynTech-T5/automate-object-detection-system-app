"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchAlertsInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debounced && debounced.trim()) params.set("q", debounced.trim());
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    if (q !== value) setValue(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function onClear() {
    setValue("");
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 w-full rounded-md border border-[var(--color-primary-bg)] px-3 py-2 focus-within:ring focus-within:ring-[var(--color-primary)] bg-white">
        <Search className="h-4 w-4 opacity-60 shrink-0 text-[var(--color-primary)]" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Search alerts  (e.g. "id:52", "event:intrusion", "camera:lobby", "location:floor2", "status:resolved", "severity:high", "door")`}
          className="w-full outline-none text-sm font-light bg-transparent"
        />
        {value ? (
          <Button type="button" variant="ghost" size="icon" onClick={onClear} className="h-6 w-6">
            <X className="h-4 w-4 text-[var(--color-primary)]" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}