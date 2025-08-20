"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type UIContextType = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
};

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // อ่าน/จำสถานะพับไว้ใน localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved != null) setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleSidebar: () => setCollapsed((v) => !v),
    }),
    [collapsed]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}