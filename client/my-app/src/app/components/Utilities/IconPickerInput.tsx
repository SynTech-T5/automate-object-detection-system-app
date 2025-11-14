"use client";

import React, { useMemo, useState } from "react";
import { icons as lucideIcons } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";

/* -------------------------------------------------------------------------- */
/*                               Icon utilities                               */
/* -------------------------------------------------------------------------- */

const kebabToPascal = (s: string) =>
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

function getIconByName(name?: string): LucideIcon {
  const ns = Icons as unknown as Record<string, LucideIcon>;
  return (name && ns[name]) || (ns["CircleHelp"] as LucideIcon);
}

function useAllIconNames() {
  return useMemo(() => {
    return Object.keys(lucideIcons).map(kebabToPascal).sort();
  }, []);
}

/* -------------------------------------------------------------------------- */
/*                                 Props type                                 */
/* -------------------------------------------------------------------------- */

export type IconPickerInputProps = {
  icon?: string;
  onIconChange?: (iconName?: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  iconFieldName?: string;
  textFieldName?: string;
  inputId?: string;
  inputName?: string;
  placeholder?: string;
  triggerLabel?: string;
  size?: number;
  className?: string;
  /** ✅ เพิ่มเพื่อให้ใส่ class ให้ช่อง input ได้ (ใช้โชว์ error border) */
  inputClassName?: string;
};

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
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
  inputClassName = "",
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
      className={`flex items-center rounded-md bg-white focus-within:ring 
        focus-within:ring-[var(--color-primary)] border outline-none ${className}`}
    >
      {iconFieldName && (
        <input type="hidden" name={iconFieldName} value={icon ?? ""} />
      )}
      {textFieldName && (
        <input type="hidden" name={textFieldName} value={value ?? ""} />
      )}

      {/* Trigger ปุ่มเลือกไอคอน */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={triggerLabel}
            className="h-10 w-10 rounded-md flex items-center justify-center text-black hover:text-[var(--color-primary)]"
          >
            <CurrentIcon size={size + 2} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[420px] p-0 max-h-[480px] overflow-y-auto overscroll-contain rounded-md"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
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
          </div>

          <div className="p-2 grid grid-cols-8 gap-2">
            {filtered.map((n) => {
              const Icon = getIconByName(n);
              const active = n === icon;
              return (
                <button
                  key={n}
                  type="button"
                  title={n}
                  onClick={() => commit(n)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] leading-tight transition ${
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-transparent hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  <Icon size={size + 2} />
                  <span className="line-clamp-1 w-full text-center">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t">
            <div className="flex items-center justify-between p-2 text-xs text-muted-foreground">
              {filtered.length} icons
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <span aria-hidden className="h-6 w-px bg-gray-300" />

      {/* ✅ เพิ่มการเชื่อม inputClassName เพื่อรองรับ error border */}
      <Input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        id={inputId}
        name={inputName}
        required
        className={`px-3 border-0 shadow-none focus-visible:ring-0 font-light ${inputClassName}`}
      />
    </div>
  );
}
