// app/components/Cameras/Details/CameraAccess.tsx
"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Shield, LockKeyhole, UserLock, Clock, UserStar, ShieldUser, Users,
} from "lucide-react";
import { Camera } from "@/app/models/cameras.model";

/* ---------- UI helpers ---------- */
function SectionCard({ title, icon: Icon, children }: { title: string; icon?: any; children: ReactNode }) {
  const IconCmp = Icon ?? Shield;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <IconCmp className="w-5 h-5 text-[var(--color-primary)]" />
        <h2 className="font-semibold text-[var(--color-primary)] text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "green"|"blue"|"orange"|"slate" }) {
  const tones: Record<string, string> = {
    green:  "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue:   "text-blue-700 bg-blue-50 border-blue-200",
    orange: "text-orange-700 bg-orange-50 border-orange-200",
    slate:  "text-slate-700 bg-slate-50 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tones[tone]}`}>
      {children}
    </span>
  );
}

const Toggle = ({
  label, enabled, setEnabled, hint, disabled,
}: {
  label: ReactNode; enabled: boolean; setEnabled: (v: boolean) => void; hint?: string; disabled?: boolean;
}) => (
  <div className="py-2">
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div className="min-w-0">
        <div className="text-slate-800 text-sm sm:text-base">{label}</div>
        {hint ? <div className="text-slate-500 text-xs mt-0.5 line-clamp-2">{hint}</div> : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${enabled ? "bg-[var(--color-primary)]/90" : "bg-slate-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
            ${enabled ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
    <div className="border-b border-slate-100 mt-3" />
  </div>
);

/* ---------- Types ---------- */
type ApiPermission = {
  permission_id: number;
  camera_id: number;
  permission_require_auth: boolean;
  permission_restrict: boolean;
  permission_log: boolean;
  permission_updated_date: string;
  permission_updated_time: string;
};

type Props =
  | { camId: number; camera?: never }
  | { camId?: never; camera: Camera };

/* ---------- Main ---------- */
export default function CameraAccess(props: Props) {
  const camId = useMemo(() => {
    if ("camId" in props && typeof props.camId === "number") return props.camId;
    if ("camera" in props && props.camera) return Number(props.camera.camera_id);
    return NaN;
  }, [props]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  const [requireAuth, setRequireAuth] = useState(false);
  const [restrict, setRestrict] = useState(false);
  const [logAccess, setLogAccess] = useState(false);

  const [saving, setSaving] = useState<null | "auth" | "restrict" | "log">(null);

  // fetch initial
  useEffect(() => {
    if (!Number.isFinite(camId) || camId <= 0) {
      setErr("Invalid camera id.");
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`/api/cameras/${camId}/permission`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);

        const row: ApiPermission | null =
          Array.isArray(json?.data) && json.data.length ? json.data[0] : null;

        if (mounted && row) {
          setRequireAuth(!!row.permission_require_auth);
          setRestrict(!!row.permission_restrict);
          setLogAccess(!!row.permission_log);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load permission");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [camId]);

  // PUT helper (optimistic)
  async function putPermission(patch: Partial<{ require_auth: boolean; restrict: boolean; log: boolean }>, flag: "auth"|"restrict"|"log") {
    setSaving(flag);
    try {
      const res = await fetch(`/api/cameras/${camId}/permission`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          require_auth: requireAuth,
          restrict,
          log: logAccess,
          ...patch,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
    } catch (e: any) {
      // rollback UI to previous state
      if (flag === "auth") setRequireAuth((v) => !v);
      if (flag === "restrict") setRestrict((v) => !v);
      if (flag === "log") setLogAccess((v) => !v);
      alert(e?.message || "Update failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
      {/* Left: Toggles */}
      <SectionCard title="Camera Access Permissions" icon={Shield}>
        {loading && <p className="text-sm text-slate-500 mb-2">Loading permissions…</p>}
        {err && !loading && <p className="text-sm text-red-600 mb-2">{err}</p>}

        <Toggle
          label={<span className="flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-[var(--color-primary)]" />
            Require Authentication
          </span>}
          hint="Users must sign in before accessing the stream."
          enabled={requireAuth}
          setEnabled={(v) => {
            // optimistic
            setRequireAuth(v);
            void putPermission({ require_auth: v }, "auth");
          }}
          disabled={loading || !!saving}
        />

        <Toggle
          label={<span className="flex items-center gap-2">
            <UserLock className="w-5 h-5 text-[var(--color-primary)]" />
            Restrict to Security Personnel
          </span>}
          hint="Only users in the Security group can access control operations."
          enabled={restrict}
          setEnabled={(v) => {
            setRestrict(v);
            void putPermission({ restrict: v }, "restrict");
          }}
          disabled={loading || !!saving}
        />

        <Toggle
          label={<span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
            Log Access Attempts
          </span>}
          hint="Keep an audit trail for all successful and failed access attempts."
          enabled={logAccess}
          setEnabled={(v) => {
            setLogAccess(v);
            void putPermission({ log: v }, "log");
          }}
          disabled={loading || !!saving}
        />
      </SectionCard>

      {/* Right: Static groups (ปรับได้ตามระบบจริง) */}
      <SectionCard title="User Access Groups" icon={Users}>
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto] items-center">
            <span className="flex items-center gap-2 text-slate-800">
              <UserStar className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Administrators</span>
            </span>
            <Badge tone="green">Full Access</Badge>
          </div>
          <div className="border-b border-slate-100" />

          <div className="grid grid-cols-[1fr_auto] items-center">
            <span className="flex items-center gap-2 text-slate-800">
              <ShieldUser className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Security Team</span>
            </span>
            <Badge tone="blue">View &amp; Control</Badge>
          </div>
          <div className="border-b border-slate-100" />

          <div className="grid grid-cols-[1fr_auto] items-center">
            <span className="flex items-center gap-2 text-slate-800">
              <Users className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Staff</span>
            </span>
            <Badge tone="orange">View Only</Badge>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}