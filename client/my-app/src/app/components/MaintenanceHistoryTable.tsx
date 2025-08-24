"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical } from "lucide-react";

// ข้อมูลจำลอง
// const records = [
//   { id: "MNT001", cameraId: "CAM001", date: "2025-05-15", type: "Routine Check", technician: "John Smith", notes: "Camera cleaned, firmware updated v3.2.1" },
//   { id: "MNT002", cameraId: "CAM002", date: "2025-05-16", type: "Repair", technician: "Jane Doe", notes: "Replaced power adapter, tested connection" },
//   { id: "MNT003", cameraId: "CAM001", date: "2025-05-17", type: "Installation", technician: "Tech Ops", notes: "Installed new camera, configured IP settings" },
//   { id: "MNT004", cameraId: "CAM003", date: "2025-05-18", type: "Upgrade", technician: "Alice Brown", notes: "Upgraded firmware to latest version" },
//   { id: "MNT005", cameraId: "CAM002", date: "2025-05-19", type: "Replacement", technician: "Bob Lee", notes: "Replaced broken lens, calibrated" },
//   { id: "MNT006", cameraId: "CAM003", date: "2025-05-20", type: "Inspection", technician: "Charlie Kim", notes: "Checked all camera angles, cleaned lenses" },
//   { id: "MNT007", cameraId: "CAM001", date: "2025-05-21", type: "Configuration", technician: "David Park", notes: "Adjusted recording schedule, updated motion detection zones" },
//   { id: "MNT008", cameraId: "CAM002", date: "2025-05-22", type: "Routine Check", technician: "Eve Lin", notes: "Firmware checked, camera performance normal" },
//   { id: "MNT009", cameraId: "CAM003", date: "2025-05-23", type: "Repair", technician: "Frank Wang", notes: "Fixed loose connection, tested alerts" },
//   { id: "MNT010", cameraId: "CAM001", date: "2025-05-24", type: "Upgrade", technician: "Grace Lee", notes: "Upgraded to firmware v4.0, rebooted camera" },
//   { id: "MNT011", cameraId: "CAM002", date: "2025-05-25", type: "Inspection", technician: "Hannah Cho", notes: "Checked video quality, cleaned sensor" },
//   { id: "MNT012", cameraId: "CAM003", date: "2025-05-26", type: "Configuration", technician: "Ian Park", notes: "Set up new notification rules and alerts" },
// ];

/* -------------------- Types -------------------- */
type MaintenanceHistory = {
  id: string;
  cameraId: string;   // ✅ กล้องแต่ละตัว
  date: string;
  type: string;
  technician: string;
  notes: string;
};

/* -------------------- Maintenance Type -------------------- */
type MaintenanceTypeBadgeProps = {
  type: string;
};

function MaintenanceTypeBadge({ type }: MaintenanceTypeBadgeProps) {
  const typeColors: Record<string, string> = {
    "Routine Check": "bg-blue-100 text-blue-600 border border-blue-300",
    "Repair": "bg-red-100 text-red-600 border border-red-300",
    "Installation": "bg-green-100 text-green-600 border border-green-300",
    "Upgrade": "bg-purple-100 text-purple-600 border border-purple-300",
    "Replacement": "bg-orange-100 text-orange-600 border border-orange-300",
    "Inspection": "bg-yellow-100 text-yellow-600 border border-yellow-300",
    "Configuration": "bg-teal-100 text-teal-600 border border-teal-300",
  };

  const classes = typeColors[type] ?? "bg-gray-100 text-gray-600 border border-gray-300";

  return (
    <div
      className={`w-full rounded-[5px] font-medium text-[12px] px-1 py-1 ${classes} text-center`}
    >
      {type}
    </div>
  );
}

/* -------------------- Maintenance History Table -------------------- */
type Props = {
  records: MaintenanceHistory[];
  cameraId: string; 
};

export default function MaintenanceHistoryTable({ records, cameraId }: Props) {
  //เอาเฉพาะกล้องที่มี id นั้น
  const filteredRecords = records.filter((rec) => rec.cameraId === cameraId);

  if (!filteredRecords?.length) {
    return <div className="text-sm text-gray-500">No maintenance records for this camera.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-[var(--color-primary)] text-[14px] font-medium mb-1">Maintenance History</h2>
      <Table className="w-full max-w-[700px] table-auto">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-0 py-3 border-b border-[var(--color-primary)] text-[var(--color-primary)] text-[12px] text-left font-medium">
              ID
            </TableHead>
            <TableHead className="px-2 py-3 border-b border-[var(--color-primary)] text-[var(--color-primary)] text-[12px] text-left font-medium">
              Date
            </TableHead>
            <TableHead className="px-2 py-3 border-b border-[var(--color-primary)] text-[var(--color-primary)] text-[12px] text-left font-medium">
              Type
            </TableHead>
            <TableHead className="px-2 py-3 border-b border-[var(--color-primary)] text-[var(--color-primary)] text-[12px] text-left font-medium">
              Technician
            </TableHead>
            <TableHead className="px-2 py-3 border-b border-[var(--color-primary)] text-[var(--color-primary)] text-[12px] text-left font-medium">
              Notes
            </TableHead>
            <TableHead className="px-2 py-3 border-b border-[var(--color-primary)]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredRecords.map((rec) => (
            <TableRow key={rec.id} className="border-b border-gray-200 align-top text-[12px]">
              <TableCell className="pl-0 py-3 align-top text-left text-[12px] font-medium">{rec.id}</TableCell>
              <TableCell className="px-2 py-3 align-top text-left text-[12px] font-medium">{rec.date}</TableCell>
              <TableCell className="px-2 py-3 align-top text-left text-[12px] font-medium">
                <MaintenanceTypeBadge type={rec.type} />
              </TableCell>
              <TableCell className="px-2 py-3 align-top font-medium text-left text-[12px]">
                {rec.technician}
              </TableCell>
              <TableCell className="px-2 py-3 whitespace-pre-wrap break-words align-top text-left text-[12px]">
                {rec.notes}
              </TableCell>
              <TableCell className="px-2 py-3 align-top text-left text-[12px]">
                <MoreVertical className="h-4 w-4 text-gray-500 cursor-pointer text-[12px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
