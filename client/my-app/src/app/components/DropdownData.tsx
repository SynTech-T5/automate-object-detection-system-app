"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface Events {
  id: number;
  icon: string;
  name: string;
}

/* ---------------------- Context & Hook ---------------------- */
const EventsContext = createContext<Events[] | null>(null);

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (ctx === null) throw new Error("useEvents must be used inside <EventsProvider>");
  return ctx;
}

/* ---------------------- Provider ---------------------- */
export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Events[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load events");
        return res.json();
      })
      .then((data: Events[]) => setEvents(data))
      .catch((err) => {
        console.error("Load events error:", err);
      });
  }, []);

  return <EventsContext.Provider value={events}>{children}</EventsContext.Provider>;
}
