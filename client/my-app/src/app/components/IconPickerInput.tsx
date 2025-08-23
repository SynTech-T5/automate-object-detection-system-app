// components/IconPickerInput.tsx
"use client";

import React, { useMemo, useState } from "react";

// ✅ ลิสต์ชื่อไอคอนทั้งหมดจาก object นี้ (คงอยู่ ไม่โดน tree-shake)
import { icons as lucideIcons } from "lucide-react";

// ✅ ใช้ namespace เพื่อ render คอมโพเนนต์จากชื่อ (PascalCase)
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

// shadcn/ui
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Command, CommandInput } from "@/components/ui/command";

/* -------------------------------------------------------------------------- */
/*                               Icon utilities                               */
/* -------------------------------------------------------------------------- */

// "alarm-clock" -> "AlarmClock"
const kebabToPascal = (s: string) =>
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

// คืนคอมโพเนนต์ไอคอนจากชื่อ PascalCase (ไม่เจอ → CircleHelp)
function getIconByName(name?: string): LucideIcon {
  const ns = Icons as unknown as Record<string, LucideIcon>;
  return (name && ns[name]) || (ns["CircleHelp"] as LucideIcon);
}

// ลิสต์ชื่อไอคอนทั้งหมด (PascalCase) จาก lucideIcons (kebab-case)
function useAllIconNames() {
  return useMemo(() => {
    return Object.keys(lucideIcons) // ["alarm-clock", "arrow-left", ...]
      .map(kebabToPascal)           // ["AlarmClock", "ArrowLeft", ...]
      .sort();
  }, []);
}

/* -------------------------------------------------------------------------- */
/*                              Component props                                */
/* -------------------------------------------------------------------------- */

export type IconPickerInputProps = {
  /** ชื่อไอคอนที่เลือก (เช่น "Bell"); undefined = ไม่มี */
  icon?: string;
  /** เรียกเมื่อเปลี่ยนไอคอน */
  onIconChange?: (iconName?: string) => void;

  /** ค่าข้อความในช่อง input ขวามือ (ไม่เกี่ยวกับไอคอน) */
  value?: string;
  /** เรียกเมื่อข้อความเปลี่ยน */
  onChange?: (value: string) => void;

  /** สำหรับผูกกับฟอร์ม: สร้าง hidden input ชื่อฟิลด์ตามนี้ */
  iconFieldName?: string;
  textFieldName?: string;

  inputId?: string;
  inputName?: string;

  /** UI */
  placeholder?: string;   // placeholder ช่องข้อความ
  triggerLabel?: string;  // ป้ายบนปุ่มเลือกไอคอน
  size?: number;          // ขนาดไอคอน (default 18)
  className?: string;     // เพิ่มคลาสภายนอก
};

/* -------------------------------------------------------------------------- */
/*                             IconPickerInput UI                              */
/* -------------------------------------------------------------------------- */

export default function IconPickerInput({
  icon,
  onIconChange,
  value,
  onChange,
  iconFieldName,
  textFieldName,
  placeholder = "Enter event name",
  triggerLabel = "Icon picker",
  inputId = "name",
  inputName = "name",
  size = 18,
  className = "",
}: IconPickerInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const allNames = useAllIconNames();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allNames;
    return allNames.filter((n) => n.toLowerCase().includes(q));
  }, [allNames, query]);

  const CurrentIcon = getIconByName(icon);

  function commit(next?: string) {
    onIconChange?.(next);
    setOpen(false);
  }

  return (
    <div
      className={`flex items-center rounded-md bg-white focus-within:ring focus-within:ring-[var(--color-primary)] border outline-none ${className}`}
    >
      {/* Hidden inputs for HTML forms */}
      {iconFieldName ? (
        <input type="hidden" name={iconFieldName} value={icon ?? ""} />
      ) : null}
      {textFieldName ? (
        <input type="hidden" name={textFieldName} value={value ?? ""} />
      ) : null}

      {/* Left trigger: ปุ่มเลือกไอคอน */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label="Choose icon"
            className="h-10 w-10 rounded-md flex items-center justify-center text-black hover:text-[var(--color-primary)]"
          >
            <CurrentIcon size={size + 2} />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[420px] p-0" sideOffset={8}>
          {/* Search */}
          <div className="p-2">
            <Command shouldFilter={false} className="rounded-md border">
              <div className="p-2">
                <CommandInput
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search icons..."
                />
              </div>
            </Command>
          </div>

          {/* Grid */}
          <ScrollArea className="h-[360px] p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No icons found.
                <div className="mt-1">
                  Check that <code>lucide-react</code> is installed and this file
                  has <code>"use client"</code>.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-2">
                {filtered.map((n) => {
                  const Icon = getIconByName(n);
                  const active = n === icon;
                  return (
                    <button
                      key={n}
                      type="button"
                      title={n}
                      onClick={() => commit(n)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] leading-tight transition ${active
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-transparent hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"
                        }`}
                    >
                      <Icon size={size + 2} />
                      <span className="line-clamp-1 w-full text-center">
                        {n}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <Separator />

          <div className="flex items-center justify-between p-2">
            {/* <Button
              type="button"
              variant="secondary"
              className="bg-[var(--color-danger)] text-[var(--color-white)] border-1 hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]"
              onClick={() => commit(undefined)}
            >
              Remove
            </Button> */}
            <div className="text-xs text-muted-foreground">
              {filtered.length} icons
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <span aria-hidden className="h-6 w-px bg-gray-300" />

      <Input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        id={inputId}
        name={inputName}
        required
        className="px-3 border-0 shadow-none focus-visible:ring-0 font-light"
      />
    </div>
  );
}