"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import CameraCard, { type Camera } from "./CameraCard";

// เหมือน table view
function parseStatusParam(v: string | null): boolean | null {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (s === "active" || s === "true" || s === "1") return true;
  if (s === "inactive" || s === "false" || s === "0") return false;
  return null;
}

export default function CameraGrid({ cameras }: { cameras: Camera[] }) {
  const params = useSearchParams();
  const want = parseStatusParam(params.get("status"));

  const filtered = useMemo(() => {
    if (want === null) return cameras;
    return cameras.filter((c) => !!c.status === want); // boolean เทียบตรง ๆ
  }, [cameras, want]);

  if (!filtered.length) {
    return <div className="text-sm text-gray-500">No cameras match this status filter.</div>;
  }

  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {filtered.map((cam) => (
        <CameraCard key={cam.id} cam={cam} />
      ))}
    </div>
  );
}
