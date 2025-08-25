"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Camera as CameraIcon } from "lucide-react";

export default function EventDetectCard() {

    const [enabled, setEnabled] = useState(false);

    return (
    <div className="relative mt-12">
        <div
            aria-hidden
            className={`
            pointer-events-none
            absolute inset-x-0 -top-7 h-16
            rounded-2xl
            bg-[var(--color-primary-bg)] border border-[var(--color-primary)]
            shadow-sm
            z-0
            `}
        />

        <div className="absolute left-10 -top-4 -translate-x-1/2 z-20">
            <div className={`grid place-items-center h-10 w-10 rounded-full bg-white border-1 border-[var(--color-primary)]} shadow`}>
                <div className={`grid place-items-center h-8 w-8 rounded-full bg-[var(--color-primary)] ring-2 ring-white`}>
                    <CameraIcon className="h-5 w-5 text-white" />
                </div>
            </div>
        </div>

        <div className={`relative z-10 rounded-xl border border-[var(--color-primary)] bg-[var(--color-white)] shadow-sm p-4 overflow-hidden`}>
            <div className="relative mt-4 flex justify-between items-center">
                <h3 className="text-base font-semibold text-[var(--color-primary)]">Title</h3>
                <button className="p-1 rounded">
                    <MoreVertical size={18} />
                </button>
            </div>

            <div className="relative mt-2 mr-10">
                <p className="text-sm text-gray-600 break-words line-clamp-3">
                    Description
                </p>
            </div>

            <div className="relative mt-4 flex justify-between items-center">
                <p className="text-sm">Enable Detection</p>

                <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        enabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    onClick={() => setEnabled(!enabled)}
                >

                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                />

                </button>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <p className="text-sm">Sensitivity</p>

                <select
                className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm 
                focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
            </div>
        </div>

    </div>

    
    )
}