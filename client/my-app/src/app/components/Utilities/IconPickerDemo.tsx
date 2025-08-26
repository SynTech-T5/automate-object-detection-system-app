// app/(with-layout)/test/IconPickerDemo.tsx
"use client";

import { useState } from "react";
import IconPickerInput from "./IconPickerInput";

export default function IconPickerDemo() {
    const [icon, setIcon] = useState<string | undefined>("TriangleAlert");
    const [name, setName] = useState("");

    return (
        <div className="space-y-2 max-w-2xl">
            {/* <label className="text-sm font-medium">
        Event Name<span className="text-blue-600">*</span>
      </label> */}
            <div className="grid gap-1">
                <IconPickerInput
                    icon={icon}
                    onIconChange={setIcon}
                    value={name}
                    onChange={setName}
                    placeholder="Enter event name"
                />
            </div>
            {/* <div className="text-sm">Selected icon: <b>{icon ?? "(none)"}</b></div> */}
        </div>
    );
}