"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AlertTable, { type Alert } from "./AlertTable"; // ปรับ path ตามโปรเจกต์
import SearchAlertsInput from "@/app/components/Alerts/SearchAlertsInput";
import AlertFilters from "@/app/components/Alerts/AlertFilters";

function getStr(v: unknown) {
    return (v ?? "").toString();
}

// --- accessors ที่ยืดหยุ่นกับโครงสร้าง alert ---
function getId(a: any): number | string {
    return a?.id ?? a?.alr_id ?? a?.alert_id ?? "";
}
function getSeverity(a: any): string {
    return getStr(a?.severity ?? a?.alr_severity).toLowerCase();
}
function getStatus(a: any): string {
    return getStr(a?.status ?? a?.alr_status).toLowerCase();
}
function getEvent(a: any): string {
    return getStr(a?.event?.name ?? a?.event_name ?? a?.evt_name ?? a?.alr_event_name);
}
function getCamera(a: any): string {
    return getStr(a?.camera?.name ?? a?.camera_name ?? a?.cam_name ?? "");
}
function getCameraId(a: any): string {
    const id = a?.camera?.id ?? a?.cam_id ?? a?.camera_id;
    return id != null ? String(id) : "";
}

// รองรับ create_date + create_time นอกเหนือจาก created_at เดิม
function getCreatedAt(a: any): Date | null {
    const date =
        a?.create_date ??
        a?.created_at ??
        a?.alr_created_at ??
        a?.timestamp ??
        a?.time ??
        a?.createdAt;
    const time = a?.create_time ?? null;

    let iso: string | null = null;
    if (date && time) iso = `${date}T${time}`;
    else if (date) {
        const s = String(date);
        iso = s.length <= 10 ? `${s}T00:00:00` : s;
    }

    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(+d) ? null : d;
}

function getLocation(a: any): string {
    // รองรับ camera.location เป็น object หรือ string
    const camLoc = a?.camera?.location;
    const camLocName = typeof camLoc === "string" ? camLoc : camLoc?.name;

    return getStr(
        camLocName ??
        a?.location?.name ??
        a?.location ??
        a?.loc_name ??
        a?.alr_location ??
        a?.cam_location
    );
}

function getDesc(a: any): string {
    return getStr(a?.description ?? a?.alr_description ?? a?.desc);
}

export default function AlertsClient({ alerts }: { alerts: Alert[] }) {
    const sp = useSearchParams();

    const q = sp.get("q") ?? "";

    // พารามิเตอร์กรอง (ทั้งหมดมาจาก URL)
    const severityParam = (sp.get("severity") ?? "").toLowerCase(); // critical|high|...
    const statusParam = (sp.get("status") ?? "").toLowerCase();   // active|resolved|...
    const eventParam = sp.get("event") ?? "";                    // string (ชื่อ event)
    const locationParam = (sp.get("location") ?? "").toLowerCase(); // string
    const cameraParam = (sp.get("camera") ?? "").toLowerCase();   // เก็บเป็น id (string) หรือชื่อ
    const fromParam = sp.get("from") ?? "";                     // YYYY-MM-DD
    const toParam = sp.get("to") ?? "";                       // YYYY-MM-DD

    // ตัวเลือก (derive จาก alerts)
    const { severityOptions, statusOptions, eventOptions } = useMemo(() => {
        const sev = new Set<string>();
        const st = new Set<string>();
        const ev = new Set<string>();

        alerts.forEach((a) => {
            const s = getSeverity(a);
            if (s) sev.add(s[0].toUpperCase() + s.slice(1));
            const ss = getStatus(a);
            if (ss) st.add(ss[0].toUpperCase() + ss.slice(1));
            const e = getEvent(a);
            if (e) ev.add(e);
        });

        if (sev.size === 0) ["Critical", "High", "Medium", "Low"].forEach((x) => sev.add(x));
        if (st.size === 0) ["Active", "Acknowledged", "Resolved", "Dismissed"].forEach((x) => st.add(x));

        return {
            severityOptions: Array.from(sev),
            statusOptions: Array.from(st),
            eventOptions: Array.from(ev),
        };
    }, [alerts]);

    const filtered = useMemo(() => {
        const fromDate = fromParam ? new Date(fromParam + "T00:00:00") : null;
        const toDate = toParam ? new Date(toParam + "T23:59:59.999") : null;

        const qTokens = q.toLowerCase().trim().split(/\s+/).filter(Boolean);

        return alerts.filter((a) => {
            // severity
            if (severityParam) {
                if (getSeverity(a) !== severityParam) return false;
            }
            // status
            if (statusParam) {
                if (getStatus(a) !== statusParam) return false;
            }
            // event type (ชื่อ)
            if (eventParam) {
                if (!getEvent(a).toLowerCase().includes(eventParam.toLowerCase())) return false;
            }
            // location
            if (locationParam) {
                if (!getLocation(a).toLowerCase().includes(locationParam)) return false;
            }
            // camera: เทียบ id จาก dropdown; อนุโลมค้นด้วยชื่อ (กรณีผู้ใช้พิมพ์เอง)
            if (cameraParam) {
                const camId = getCameraId(a).toLowerCase();
                const camName = getCamera(a).toLowerCase();
                if (cameraParam !== camId && !camName.includes(cameraParam)) return false;
            }
            // date range
            const d = getCreatedAt(a);
            if (fromDate && d && d < fromDate) return false;
            if (toDate && d && d > toDate) return false;

            // free-text search
            if (qTokens.length) {
                const blob = (
                    `${getId(a)} ${getEvent(a)} ${getCamera(a)} ${getLocation(a)} ${getDesc(a)} ${getSeverity(a)} ${getStatus(a)}`
                ).toLowerCase();
                for (const t of qTokens) if (!blob.includes(t)) return false;
            }
            return true;
        });
    }, [alerts, q, severityParam, statusParam, eventParam, locationParam, cameraParam, fromParam, toParam]);

    return (
        <>
            {/* Search (ซ้าย) + Filters (ขวา) */}
            <div className="grid gap-2 items-start sm:gap-3 mt-3">
                <div className="w-full">
                    <SearchAlertsInput />  {/* ถ้าใช้ SearchCamerasInput ก็ใส่ตัวนั้น */}
                </div>
                <div className="w-full">
                    <AlertFilters
                        eventOptions={eventOptions}
                    /> {/* ถ้าใช้ CameraFilters ก็ใส่แทนได้ */}
                </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 mt-4">
                <AlertTable alerts={filtered as any} />
            </div>
        </>
    );
}