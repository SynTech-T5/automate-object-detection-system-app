// app/components/Account/ProfileSettings.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { StatusMessage } from "@/app/components/Utilities/StatusMessage";

type Me = {
  usr_id: number;
  usr_username: string;
  usr_email: string;
  usr_role?: string;
  usr_name?: string | null;
  usr_phone?: string | null;
  avatar_url?: string;
};

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
function initials(name?: string | null) {
  const t = (name ?? "").trim();
  if (!t) return "U";
  const s = t.split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");
  return s || "U";
}
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePhone(v: string): string {
  const trimmed = v.trim();
  if (trimmed === "") return "";
  const digits = (trimmed.match(/\d/g) || []).length;
  if (!/^[+\d][\d\s\-()]*$/.test(trimmed)) return "Invalid phone number.";
  if (digits < 7) return "Invalid phone number.";
  if (digits > 10) return "Phone must be at most 10 digits.";
  return "";
}

export default function AccountSettings() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);

  // current
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // originals
  const [origName, setOrigName] = useState<string | null>(null);
  const [origPhone, setOrigPhone] = useState<string | null>(null);
  const [origEmail, setOrigEmail] = useState<string>("");

  // ✅ ข้อความสรุปผลจากการยิง API (ใช้ StatusMessage)
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "info" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json?.message || `HTTP ${r.status}`);
        if (!mounted) return;

        const m: Me = json;
        setMe(m);

        const initName = m?.usr_name ?? "";
        const initPhone = m?.usr_phone ?? "";
        const initEmail = m?.usr_email ?? "";

        setName(initName);
        setPhone(initPhone);
        setEmail(initEmail);

        setOrigName(m?.usr_name ?? null);
        setOrigPhone(m?.usr_phone ?? null);
        setOrigEmail(m?.usr_email ?? "");
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // -------------------- Validation (โชว์ข้อความแดงธรรมดา) --------------------
  const nameError = useMemo(() => {
    if (!editMode) return "";
    const now = name.trim();
    const hadOriginal = origName !== null && origName !== undefined;
    if (hadOriginal && now === "") return "Name cannot be empty.";
    return "";
  }, [editMode, name, origName]);

  const phoneError = useMemo(() => {
    if (!editMode) return "";
    const hadOriginal = origPhone !== null && origPhone !== undefined;
    const now = phone.trim();
    if (hadOriginal && now === "") return "Phone cannot be empty.";
    if (now !== "") {
      const msg = validatePhone(now);
      if (msg) return msg;
    }
    return "";
  }, [editMode, phone, origPhone]);

  const emailError = useMemo(() => {
    if (!editMode) return "";
    const v = email.trim();
    if (!v) return "Email is required.";
    if (!isValidEmail(v)) return "Invalid email format.";
    return "";
  }, [editMode, email]);

  const isChanged = useMemo(() => {
    const n = name.trim();
    const p = phone.trim();
    const e = email.trim();
    const origN = (origName ?? "").trim();
    const origP = (origPhone ?? "").trim();
    const origE = (origEmail ?? "").trim();
    return n !== origN || p !== origP || e !== origE;
  }, [name, phone, email, origName, origPhone, origEmail]);

  const canSave = isChanged && !nameError && !phoneError && !emailError && !saving;

  async function saveProfile() {
    if (!canSave || !me?.usr_id) return;
    try {
      setSaving(true);
      setSaveMsg(null);
      setSaveStatus(null);

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };

      const res = await fetch(`/api/users/${me.usr_id}/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Update failed");

      setMe((prev) =>
        prev
          ? {
              ...prev,
              usr_name: payload.name || null,
              usr_phone: payload.phone || null,
              usr_email: payload.email,
            }
          : prev
      );

      setOrigName(payload.name || null);
      setOrigPhone(payload.phone || null);
      setOrigEmail(payload.email);

      setEditMode(false);
      setSaveMsg(json?.message || "Updated successfully");
      setSaveStatus("success"); // ✅ ใช้ component แสดงผลสำเร็จ
    } catch (e: any) {
      setSaveMsg(e?.message || "Update failed");
      setSaveStatus("error");   // ✅ ใช้ component แสดงผลผิดพลาด
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSaveMsg(null);
        setSaveStatus(null);
      }, 3000);
    }
  }

  function getRoleBadgeClass(role?: string): string {
    if (!role) return "bg-gray-100 text-gray-500";
    switch (role.toLowerCase()) {
      case "system":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-red-100 text-red-700";
      case "security team":
        return "bg-amber-100 text-amber-700";
      case "staff":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-[var(--color-primary,#2563eb)]/10 text-[var(--color-primary,#2563eb)]";
    }
  }

  // ------------------------------ UI ------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-full" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 w/full bg-gray-200 rounded" />
              <div className="h-10 w/full bg-gray-200 rounded" />
              <div className="h-10 w/full bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (err) {
    return <div className="text-sm text-rose-600">Error: {err}</div>;
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------ My Profile ----------------------------- */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm pt-0">
        <CardContent className="p-6">
          <div className="mb-4 text-sm font-medium tracking-wide text-[var(--color-primary,#2563eb)]">
            My Profile
          </div>

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-16 w-16 flex-shrink-0 rounded-full ring-1 ring-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center text-gray-500 text-lg font-semibold">
                {me?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  initials(me?.usr_username)
                )}
              </div>

              <div className="min-w-0 text-center sm:text-left">
                <h2 className="truncate text-lg font-semibold leading-tight text-gray-900">
                  {me?.usr_username || "-"}
                </h2>

                <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getRoleBadgeClass(me?.usr_role)}`}
                  >
                    {me?.usr_role || "staff"}
                  </span>

                  <span className="hidden select-none text-gray-300 sm:inline">•</span>

                  <span className="inline-flex max-w-full items-center gap-1 text-sm text-gray-500">
                    <Icons.Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{me?.usr_email || "-"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="ghost"
                  className="h-8 px-3 border border-[var(--color-primary,#2563eb)] text-[var(--color-primary,#2563eb)] hover:bg-[var(--color-primary,#2563eb)] hover:text-white"
                >
                  <Icons.Pencil className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={saveProfile}
                    disabled={!canSave}
                    className="h-8 px-3 bg-[var(--color-primary,#2563eb)] text-white hover:bg-[var(--color-secondary,#1d4ed8)] disabled:opacity-50"
                    title={!isChanged ? "No changes" : (nameError || phoneError || emailError) ? "Fix errors first" : ""}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      setName(origName ?? "");
                      setPhone(origPhone ?? "");
                      setEmail(origEmail ?? "");
                      setSaveMsg(null);
                      setSaveStatus(null);
                    }}
                    variant="ghost"
                    className="h-8 px-3 border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="my-5 h-px bg-gray-200" />

          {/* Form fields (error input = ข้อความแดงธรรมดาใต้ field) */}
          <div className="grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
            <Field label="Name">
              {editMode ? (
                <div className="grid gap-1">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  {nameError ? <p className="text-xs text-rose-600">{nameError}</p> : null}
                </div>
              ) : (
                <StaticText>{me?.usr_name ?? "-"}</StaticText>
              )}
            </Field>

            <Field label="Email">
              {editMode ? (
                <div className="grid gap-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    aria-invalid={!!emailError}
                  />
                  {emailError ? <p className="text-xs text-rose-600">{emailError}</p> : null}
                </div>
              ) : (
                <StaticText>{me?.usr_email || "-"}</StaticText>
              )}
            </Field>

            <Field label="Phone">
              {editMode ? (
                <div className="grid gap-1">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    inputMode="tel"
                  />
                  {phoneError ? <p className="text-xs text-rose-600">{phoneError}</p> : null}
                </div>
              ) : (
                <StaticText>{me?.usr_phone ?? "-"}</StaticText>
              )}
            </Field>
          </div>

          {/* ✅ ผลลัพธ์จากการยิง API ใช้ StatusMessage */}
          {saveMsg ? <div className="mt-4"><StatusMessage message={saveMsg} status={saveStatus || "info"} /></div> : null}
        </CardContent>
      </Card>

      {/* --------------------------- Change Password -------------------------- */}
      <Card className="rounded-2xl border border-gray-200 shadow-sm pt-0">
        <CardContent className="p-6">
          <div className="text-[var(--color-primary,#2563eb)] font-semibold mb-4">
            Change Password
          </div>
          <ChangePasswordBox usrId={me?.usr_id} />
        </CardContent>
      </Card>
    </div>
  );
}

/* --------------------------- ChangePassword Box --------------------------- */
function ChangePasswordBox({ usrId }: { usrId?: number }) {
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [rePwd, setRePwd] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);

  // ✅ ผลจากการ “ยิง API” เปลี่ยนรหัส ใช้ StatusMessage
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdStatus, setPwdStatus] = useState<"success" | "error" | "info" | null>(null);

  // ผู้ใช้เริ่มพิมพ์หรือยัง?
  const dirty = !!curPwd || !!newPwd || !!rePwd;

  // ✅ error input = แสดงข้อความแดงธรรมดา (ไม่ใช้ StatusMessage)
  const pwdError = useMemo(() => {
    if (!dirty) return "";
    if (!usrId) return "Missing user id.";
    if (!curPwd) return "Current password is required.";
    if (newPwd.length < 8) return "New password must be at least 8 characters.";
    if (newPwd === curPwd) return "New password must be different from current.";
    if (newPwd !== rePwd) return "Passwords do not match.";
    return "";
  }, [dirty, usrId, curPwd, newPwd, rePwd]);

  function showPwdStatus(msg: string, status: "success" | "error" | "info") {
    setPwdMsg(msg);
    setPwdStatus(status);
    setTimeout(() => {
      setPwdMsg(null);
      setPwdStatus(null);
    }, 3000);
  }

  async function submitPassword() {
    // บังคับตรวจ input ก่อนยิง API
    if (!usrId) return showPwdStatus("Missing user id.", "error");
    if (!curPwd) return showPwdStatus("Current password is required.", "error");
    if (newPwd.length < 8) return showPwdStatus("New password must be at least 8 characters.", "error");
    if (newPwd === curPwd) return showPwdStatus("New password must be different from current.", "error");
    if (newPwd !== rePwd) return showPwdStatus("Passwords do not match.", "error");

    try {
      setPwdBusy(true);
      setPwdMsg(null);
      setPwdStatus(null);

      // 1) recheck current password
      const recheck = await fetch(`/api/auth/recheck`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: curPwd }),
      });
      const reJson = await recheck.json().catch(() => ({}));
      if (!recheck.ok || reJson?.success !== true) {
        showPwdStatus(reJson?.error || "Password incorrect", "error");
        return;
      }

      // 2) patch new password
      const res = await fetch(`/api/users/${usrId}/password`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPwd }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showPwdStatus(json?.message || "Could not update password", "error");
        return;
      }

      showPwdStatus(json?.message || "Updated successfully", "success");
      setCurPwd("");
      setNewPwd("");
      setRePwd("");
    } catch (e: any) {
      showPwdStatus(e?.message || "Update failed", "error");
    } finally {
      setPwdBusy(false);
    }
  }

  return (
    <div className="grid gap-4 max-w-xl">
      <Field label="Your Password">
        <Input
          type="password"
          value={curPwd}
          onChange={(e) => setCurPwd(e.target.value)}
          placeholder="Current password"
        />
      </Field>

      <Field label="New Password">
        <Input
          type="password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          placeholder="Enter your new password"
        />
      </Field>

      <Field label="Re-enter your new password">
        <Input
          type="password"
          value={rePwd}
          onChange={(e) => setRePwd(e.target.value)}
          placeholder="Confirm password"
        />
      </Field>

      {/* ❌ input error: แสดงข้อความแดงธรรมดา */}
      {pwdError ? <p className="text-xs text-rose-600">{pwdError}</p> : null}

      {/* ✅ ผลลัพธ์จากการยิง API: ใช้ StatusMessage */}
      {pwdMsg ? <StatusMessage message={pwdMsg} status={pwdStatus || "info"} /> : null}

      <div className="flex items-center gap-2">
        <Button
          onClick={submitPassword}
          disabled={pwdBusy}
          className="h-8 px-4 bg-[var(--color-primary,#2563eb)] hover:bg-[var(--color-secondary,#1d4ed8)] text-white"
        >
          {pwdBusy ? "Updating…" : "Update"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setCurPwd("");
            setNewPwd("");
            setRePwd("");
            setPwdMsg(null);
            setPwdStatus(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------- Reusable UI ------------------------------ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <label className="text-xs text-gray-500">{label}</label>
      {children}
    </div>
  );
}
function StaticText({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-gray-800">{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
        "outline-none focus:ring-2 focus:ring-[var(--color-primary,#2563eb)]"
      )}
    />
  );
}
