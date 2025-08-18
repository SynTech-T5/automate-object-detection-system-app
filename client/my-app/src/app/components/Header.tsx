"use client";

import { useEffect, useState } from "react";
import { useUI } from "./ui-provider";
import { PanelLeft, PanelLeftOpen, Bell, UserRound } from "lucide-react";
import ClockLive from "./ClockLive";
import Image from "next/image";

type Me = { usr_id: number; usr_username: string; usr_email: string; usr_role?: string };

export default function Header({ userName = "Admin" }: { userName?: string }) {
    const { collapsed, toggleSidebar } = useUI();
    const [me, setMe] = useState<Me | null>(null);

    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(setMe)
            .catch(() => setMe(null));
    }, []);

    // เวลาแบบ Fri, Jul 18, 2025 at 10:08:19 PM
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const datePart = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(now);
    const timePart = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(now);

    return (
        <header
            className="sticky top-0 z-40 w-full bg-[color:var(--color-white)]"
            role="banner"
        >
            <div className="flex h-14 md:h-16 items-center justify-between gap-3 px-3 md:px-6">
                {/* Left: toggle + brand */}
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-50"
                        title={collapsed ? "Open sidebar" : "Collapse sidebar"}
                        aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeft size={18} />}
                    </button>

                    {/* โลโก้/ชื่อระบบ */}
                    <div className="flex items-center gap-2 min-w-0">
                        {/* ไอคอน (ตัวอย่าง) */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-primary-bg)]">
                            {/* ถ้ามีโลโก้จริงใช้ <Image src="/logo.svg" .../> */}
                            <svg viewBox="0 0 24 24" width="18" height="18">
                                <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="var(--color-primary)" />
                                <circle cx="12" cy="12" r="3" fill="var(--color-primary)" />
                            </svg>
                        </div>

                        {/* ชื่อแบบสองโทนสี */}
                        <div className="hidden sm:block truncate">
                            <span className="font-semibold text-[color:var(--color-secondary)]">Automate</span>{" "}
                            <span className="font-semibold text-[color:var(--color-primary)]">
                                Object Detection System
                            </span>
                        </div>
                        {/* compact (จอเล็กมาก) */}
                        <div className="sm:hidden leading-tight">
                            <div className="text-xs font-semibold text-[color:var(--color-secondary)]">Automate</div>
                            <div className="text-[10px] text-[color:var(--color-primary)]">Object Detection System</div>
                        </div>
                    </div>
                </div>

                {/* Right: meta */}
                <div className="flex items-center gap-3 md:gap-5 text-sm">
                    <div className="hidden sm:flex items-center gap-2 text-gray-600">
                        <ClockLive timeZone="Asia/Bangkok" />
                    </div>

                    <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-50"
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <UserRound size={18} />
                        <span className="hidden sm:inline">{me ? `${me.usr_username}` : 'Guest'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}