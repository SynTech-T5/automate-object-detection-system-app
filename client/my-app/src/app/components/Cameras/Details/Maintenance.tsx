import MaintenanceHistoryTable from '@/app/components/MaintenanceHistoryTable'
import Createnote from "@/app/components/CreateNote"
import { Separator } from "@/components/ui/separator";

const records = [
    { id: "MNT001", cameraId: 1, date: "2025-05-15", type: "Routine Check", technician: "John Smith", notes: "Camera cleaned, firmware updated v3.2.1" },
    { id: "MNT002", cameraId: 2, date: "2025-05-16", type: "Repair", technician: "Jane Doe", notes: "Replaced power adapter, tested connection" },
    { id: "MNT003", cameraId: 1, date: "2025-05-17", type: "Installation", technician: "Tech Ops", notes: "Installed new camera, configured IP settings" },
    { id: "MNT004", cameraId: 3, date: "2025-05-18", type: "Upgrade", technician: "Alice Brown", notes: "Upgraded firmware to latest version" },
    { id: "MNT005", cameraId: 2, date: "2025-05-19", type: "Replacement", technician: "Bob Lee", notes: "Replaced broken lens, calibrated" },
    { id: "MNT006", cameraId: 3, date: "2025-05-20", type: "Inspection", technician: "Charlie Kim", notes: "Checked all camera angles, cleaned lenses" },
    { id: "MNT007", cameraId: 1, date: "2025-05-21", type: "Configuration", technician: "David Park", notes: "Adjusted recording schedule, updated motion detection zones" },
    { id: "MNT008", cameraId: 2, date: "2025-05-22", type: "Routine Check", technician: "Eve Lin", notes: "Firmware checked, camera performance normal" },
    { id: "MNT009", cameraId: 3, date: "2025-05-23", type: "Repair", technician: "Frank Wang", notes: "Fixed loose connection, tested alerts" },
    { id: "MNT010", cameraId: 1, date: "2025-05-24", type: "Upgrade", technician: "Grace Lee", notes: "Upgraded to firmware v4.0, rebooted camera" },
    { id: "MNT011", cameraId: 2, date: "2025-05-25", type: "Inspection", technician: "Hannah Cho", notes: "Checked video quality, cleaned sensor" },
    { id: "MNT012", cameraId: 3, date: "2025-05-26", type: "Configuration", technician: "Ian Park", notes: "Set up new notification rules and alerts" },
];

export default function Maintenance() {
    return (
        <>
            <label
                htmlFor="Maintenance"
                className="min-w-0 flex-1 font-bold text-lg text-[var(--color-primary)]"
            >
                Maintenance History
            </label>

            <MaintenanceHistoryTable records={records} />

            <Separator className="bg-[var(--color-primary-bg)] my-3" />

            <Createnote/>
        </>
    );
}