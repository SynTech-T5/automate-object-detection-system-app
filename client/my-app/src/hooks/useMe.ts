'use client';

import { useEffect, useState } from "react";

export interface MeResponse {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_role: string;
}

export function useMe() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", 
          cache: "no-store",      
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data: MeResponse = await res.json();
        setMe(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  return { me, loading, error };
}
