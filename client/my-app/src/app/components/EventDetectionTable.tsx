import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type EventRow = {
    id: number;
    name: string;
    icon: string;
    sensitivity: string;
    priority: string;
    status: boolean;
};

// กำหนดค่าเริ่มต้น (mock data สำหรับทดสอบตาราง)
const initialEvents: EventRow[] = [
    { id: 1, name: "Fighting / Physical Assault Test Test Test Test ", icon: "🔴", sensitivity: "Medium", priority: "High", status: true },
    { id: 2, name: "Person Falling Down", icon: "🟠", sensitivity: "Medium", priority: "High", status: false },
    { id: 3, name: "Theft or Suspicious Behavior", icon: "🟡", sensitivity: "Medium", priority: "High", status: true },
    { id: 4, name: "Unauthorized Access", icon: "🔒", sensitivity: "Medium", priority: "High", status: true },
    { id: 5, name: "Fire or Smoke Detection", icon: "🔥", sensitivity: "Medium", priority: "High", status: false },
    { id: 6, name: "Vehicle Accidents", icon: "🚗", sensitivity: "Medium", priority: "High", status: true },
    { id: 7, name: "Crowd Gathering", icon: "👥", sensitivity: "Medium", priority: "High", status: false },
    { id: 8, name: "Loitering Detection", icon: "🚶‍♂️", sensitivity: "Medium", priority: "High", status: true },
    { id: 9, name: "Abandoned Object Detection", icon: "🎒", sensitivity: "Medium", priority: "High", status: false },
    { id: 10, name: "Slip and Fall Detection", icon: "🤸‍♂️", sensitivity: "Medium", priority: "High", status: true },
];

// ตัวเลือกสำหรับ dropdown (ใช้ได้ทั้ง Sensitivity และ Priority)
const dropdownOptions = ["High", "Medium", "Low"];


const EventDetectionTable: React.FC = () => {
    // state เก็บ event ทั้งหมด
    const [events, setEvents] = useState<EventRow[]>(initialEvents);
    // state เก็บว่า dropdown ไหนเปิดอยู่ (id และ field)
    const [openDropdown, setOpenDropdown] = useState<{ id: number; field: "sensitivity" | "priority" } | null>(null);
    
    // ฟังก์ชันอัปเดตค่าใน event
    const handleUpdate = (id: number, field: keyof EventRow, value: string | boolean) => {
        setEvents(prev =>
            prev.map(ev => (ev.id === id ? { ...ev, [field]: value } : ev))
        );
    };

    return (
        <div className="bg-white p-6">
            {/* ทำ responsive table */}
            <div className="max-w-5xl mx-auto overflow-x-auto">
                {/* กันบีบจนคอลัมน์ซ้อน */}
                <div className="min-w-[800px]">

                    {/* Header */}
                    <div className="grid grid-cols-12 border-b border-blue-600 pb-2 mb-4 text-blue-600 font-semibold text-base">
                        <div className="col-span-4 pl-6">Event</div>
                        <div className="col-span-3 border-l border-blue-600 pl-6">Sensitivity</div>
                        <div className="col-span-3 border-l border-blue-600 pl-6">Alert Priority</div>
                        <div className="col-span-2 border-l border-blue-600 pl-6">Status</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-300">
                        {events.map((event) => (
                            <div key={event.id} className="grid grid-cols-12 items-center py-4 relative">
                                
                                {/* Event */}
                                <div className="col-span-4 flex items-center space-x-3 overflow-hidden pl-6">
                                    <span className="text-xl flex-shrink-0">{event.icon}</span>
                                    <span className="text-black text-base font-normal truncate">{event.name}</span>
                                </div>

                                {/* Sensitivity */}
                                <div className="col-span-3 relative pl-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenDropdown(
                                                openDropdown?.id === event.id && openDropdown.field === "sensitivity"
                                                    ? null
                                                    : { id: event.id, field: "sensitivity" }
                                            )
                                        }
                                        className="w-40 border border-gray-300 rounded-md flex justify-between items-center text-gray-900 text-sm bg-white"
                                    >
                                        <span className="px-2 py-1">{event.sensitivity}</span>
                                        <span className="px-2">
                                            {openDropdown?.id === event.id && openDropdown.field === "sensitivity" ? (
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                        </span>
                                    </button>

                                    {openDropdown?.id === event.id && openDropdown.field === "sensitivity" && (
                                        <div className="absolute top-full mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-md z-20">
                                            <ul>
                                                {dropdownOptions.map((opt) => (
                                                    <li key={opt}>
                                                        <button
                                                            className="w-full text-left px-2 py-1 hover:bg-gray-100 text-sm"
                                                            onClick={() => {
                                                                handleUpdate(event.id, "sensitivity", opt);
                                                                setOpenDropdown(null);
                                                            }}
                                                        >
                                                            {opt}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Alert Priority */}
                                <div className="col-span-3 relative pl-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenDropdown(
                                                openDropdown?.id === event.id && openDropdown.field === "priority"
                                                    ? null
                                                    : { id: event.id, field: "priority" }
                                            )
                                        }
                                        className="w-40 border border-gray-300 rounded-md flex justify-between items-center text-gray-900 text-sm bg-white"
                                    >
                                        <span className="px-2 py-1">{event.priority}</span>
                                        <span className="px-2">
                                            {openDropdown?.id === event.id && openDropdown.field === "priority" ? (
                                                <ChevronUp className="w-4 h-4 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            )}
                                        </span>
                                    </button>

                                    {openDropdown?.id === event.id && openDropdown.field === "priority" && (
                                        <div className="absolute top-full mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-md z-20">
                                            <ul>
                                                {dropdownOptions.map((opt) => (
                                                    <li key={opt}>
                                                        <button
                                                            className="w-full text-left px-2 py-1 hover:bg-gray-100 text-sm"
                                                            onClick={() => {
                                                                handleUpdate(event.id, "priority", opt);
                                                                setOpenDropdown(null);
                                                            }}
                                                        >
                                                            {opt}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex justify-start pl-6">
                                    <input
                                        type="checkbox"
                                        checked={event.status}
                                        onChange={() => handleUpdate(event.id, "status", !event.status)}
                                        className="relative w-10 h-5 bg-gray-300 rounded-full appearance-none cursor-pointer transition-colors
                                            before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4
                                            before:bg-white before:rounded-full before:shadow-sm before:transition-transform
                                            checked:bg-blue-500 checked:before:translate-x-5"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventDetectionTable;
