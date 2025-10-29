"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CameraCard from "./CameraCard";
import { Camera } from "@/app/models/cameras.model";

/* --------------------------- Utilities --------------------------- */
function parseStatusParam(v: string | null): boolean | null {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (s === "active" || s === "true" || s === "1") return true;
  if (s === "inactive" || s === "false" || s === "0") return false;
  return null;
}

/* --------------------------- Main Component --------------------------- */
export default function CameraGrid({ cameras }: { cameras: Camera[] }) {
  const params = useSearchParams();
  const want = parseStatusParam(params.get("status"));
  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    if (want === null) return cameras;
    return cameras.filter((c) => !!c.camera_status === want);
  }, [cameras, want]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [want, cameras]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const paged = filtered.slice(start, end);

  if (!filtered.length) {
    return (
      <div className="text-sm text-gray-500">
        No cameras match this status filter.
      </div>
    );
  }

  return (
    <div className="col-span-full w-full space-y-4">
      {/* Grid */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {paged.map((cam) => (
          <CameraCard key={cam.camera_id} cam={cam} />
        ))}
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-gray-500">
          Showing <span className="font-medium">{total ? start + 1 : 0}</span>–
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-3 py-1 rounded-md border text-sm ${
              page <= 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          <div className="text-sm tabular-nums">
            {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-3 py-1 rounded-md border text-sm ${
              page >= totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}