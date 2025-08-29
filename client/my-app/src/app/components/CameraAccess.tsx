// components/CameraAccess.tsx
"use client";

import { ReactNode, useState } from "react";
import {
  LockKeyhole, UserLock, Clock, UserStar, ShieldUser, Users, Shield
} from "lucide-react";

/* ---------- Reusable ---------- */
function SectionCard({ title, icon: Icon, children }: { title: string; icon?: any; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon ? <Icon className="w-5 h-5 text-[var(--color-primary)]" /> : <Shield className="w-5 h-5 text-[var(--color-primary)]" />}
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

/* Accessible toggle: role="switch", aria-checked, focus-visible */
const Toggle = ({
  label, enabled, setEnabled, hint
}: {
  label: ReactNode; enabled: boolean; setEnabled: (v: boolean) => void; hint?: string;
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
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${enabled ? "bg-[var(--color-primary)]/90" : "bg-slate-300"}
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

/* ---------- Main Component ---------- */
export default function CameraAccess() {
  const [auth, setAuth] = useState(true);
  const [restrict, setRestrict] = useState(true);
  const [logAccess, setLogAccess] = useState(true);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
      {/* Left */}
      <SectionCard title="Camera Access Permissions" icon={Shield}>
        <Toggle
          label={<span className="flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-[var(--color-primary)]" />
            Require Authentication
          </span>}
          hint="Users must sign in before accessing the stream."
          enabled={auth} setEnabled={setAuth}
        />

        <Toggle
          label={<span className="flex items-center gap-2">
            <UserLock className="w-5 h-5 text-[var(--color-primary)]" />
            Restrict to Security Personnel
          </span>}
          hint="Only users in the Security group can access control operations."
          enabled={restrict} setEnabled={setRestrict}
        />

        <Toggle
          label={<span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
            Log Access Attempts
          </span>}
          hint="Keep an audit trail for all successful and failed access attempts."
          enabled={logAccess} setEnabled={setLogAccess}
        />
      </SectionCard>

      {/* Right */}
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