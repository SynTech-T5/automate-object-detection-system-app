"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DropdownMenuDemo({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  // ---- Detect platform เพื่อโชว์ปุ่มให้ตรง OS ----
  const isMac = typeof navigator !== "undefined"
    ? /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
      /Mac OS/.test(navigator.userAgent || "")
    : false;

  const shortcutSettings = isMac ? "⌘E" : "Ctrl+E";
  const shortcutHelp = isMac ? "⌘H" : "Ctrl+H";
  const shortcutLogout = isMac ? "⇧⌘Q" : "Ctrl+Shift+Q";

  function handleSettings() {
    window.location.href = "/settings";
  }

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/login";
    } catch (_) {
      // noop
    } finally {
      setLoading(false);
    }
  }

  // ---- คีย์ลัด: ⌘B (Mac) / Ctrl+B → เปิด Settings ----
  // ---- คีย์ลัด: ⇧⌘Q (Mac) / Ctrl+Shift+Q → Logout ----
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        el.isContentEditable ||
        (tag === "div" && el.getAttribute("role") === "textbox")
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;

      const key = e.key.toLowerCase();
      const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // เปิดหน้า Settings (Settings)
      if (metaOrCtrl && !e.shiftKey && key === "e") {
        e.preventDefault();
        handleSettings();
      }

      // Logout
      if (metaOrCtrl && e.shiftKey && key === "q") {
        e.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMac, loading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleSettings}>
            Settings
            <DropdownMenuShortcut>{shortcutSettings}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            Help
            <DropdownMenuShortcut>{shortcutHelp}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>{shortcutLogout}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}