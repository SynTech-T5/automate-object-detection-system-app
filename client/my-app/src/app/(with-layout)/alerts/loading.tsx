// app/alerts/loading.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// บล็อก skeleton เบื้องต้น
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-800/60 " + className
      }
      aria-hidden="true"
    />
  );
}

export default function Loading() {
  const cardCount = 4;
  const rowCount = 8;

  return (
    <div className="space-y-6 rounded-lg bg-[var(--color-white)] p-6 shadow-md">
      {/* Header / Actions */}
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-8 w-48" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-9 w-64" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <Table className="table-auto w-full">
          <TableHeader>
            <TableRow>
              {[
                "Severity",
                "Alert ID",
                "Timestamp",
                "Camera",
                "Event Type",
                "Location",
                "Status",
                "Actions",
              ].map((h) => (
                <TableHead key={h}>
                  <SkeletonBlock className="h-5 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, r) => (
              <TableRow key={r}>
                <TableCell>
                  <SkeletonBlock className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <SkeletonBlock className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <SkeletonBlock className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <SkeletonBlock className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-4 rounded-full" />
                    <SkeletonBlock className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-4 rounded-full" />
                    <SkeletonBlock className="h-4 w-28" />
                  </div>
                </TableCell>
                <TableCell>
                  <SkeletonBlock className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-8 w-16 rounded-sm" />
                    <SkeletonBlock className="h-8 w-24 rounded-sm" />
                    <SkeletonBlock className="h-8 w-24 rounded-sm" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
