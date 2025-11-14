'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardFooter, CardHeader,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usernameOrEmail, password, remember }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Login failed');

      localStorage.setItem("access_token", data.token);

      window.location.href = '/cameras';
    } catch (e: any) {
      setErr(e.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  console.log('Token: ', localStorage.getItem("access_token"));

  return (
    <main
      className="
        relative isolate min-h-[100dvh] overflow-hidden
        bg-gradient-to-b from-[#F0F7FF] via-[#F6FAFF] to-[#EEF2FF]
        dark:from-[#0B1220] dark:via-[#0A1020] dark:to-[#0A0F1E]
      "
    >
      {/* Blue spotlights background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[42rem] w-[42rem] rounded-full bg-blue-300/40 blur-3xl dark:bg-blue-900/30" />
        <div className="absolute -bottom-48 -right-40 h-[48rem] w-[48rem] rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-900/30" />
        {/* Subtle divider line */}
        {/* <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent dark:via-blue-800/30" /> */}
      </div>

      <section className="grid min-h-[100dvh] place-items-center p-4">
        <Card className="w-full max-w-sm shadow-lg border border-slate-200/60 bg-white/80 backdrop-blur-md dark:bg-slate-900/60 dark:border-slate-800/60">
          <CardHeader className="space-y-5">
            <div className="flex items-center justify-center gap-3">
              <img src="/automate-object-detection-system-icon.png" alt="Logo" className="h-9 w-9" />
              <div className="leading-tight">
                <div className="text-xl font-semibold text-[var(--color-secondary,_#1E3A8A)]">
                  Automate
                </div>
                <div className="text-sm font-medium text-[var(--color-primary,_#0B63FF)]">
                  Object Detection System
                </div>
              </div>
            </div>
            <label htmlFor="Login" className="text-[var(--color-primary,_#0B63FF)] font-bold">Login</label>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2 mb-6">
                <label htmlFor="usernameOrEmail" className="text-sm font-light">Username or Email</label>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 text-sm font-light bg-white/90 dark:bg-slate-950/30"
                  required
                />
              </div>

              <div className="grid gap-2 mb-6">
                <label htmlFor="password" className="text-sm font-light">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter your password'
                    className="w-full rounded-md border border-slate-200 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-200 text-sm font-light bg-white/90 dark:bg-slate-950/30"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPass ? "Hide password" : "Show password"}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mb-6">
                <label htmlFor="remember" className="group inline-flex items-center gap-3 cursor-pointer select-none text-sm font-light">
                  <span className="relative inline-grid h-5 w-5 place-items-center">
                    {/* ตัว input จริง (คง semantics + focus) */}
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="
        peer absolute inset-0 h-5 w-5 cursor-pointer appearance-none opacity-0 rounded-sm
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-opacity-30
        disabled:cursor-not-allowed
      "
                    />
                    {/* กล่องแสดงผล */}
                    <span
                      className="
        h-5 w-5 rounded-sm border transition
        border-[var(--color-primary)] bg-[var(--color-primary-bg)]
        group-hover:brightness-105
        peer-active:scale-95
        peer-checked:bg-[var(--color-primary)]
        peer-checked:border-[var(--color-primary)]
        peer-disabled:opacity-60
      "
                    />
                    {/* ไอคอนติ๊ก (โชว์ตอน checked) */}
                    <svg
                      viewBox="0 0 20 20"
                      className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                      aria-hidden="true"
                    >
                      <path fill="currentColor" d="M16.704 5.292a1 1 0 010 1.416l-8.25 8.25a1 1 0 01-1.416 0L3.296 11.67a1 1 0 111.416-1.416l2.326 2.326 7.542-7.542a1 1 0 011.124-.246z" />
                    </svg>
                  </span>
                  <span>Remember me</span>
                </label>

                <a
                  href="/forgot"
                  className="text-sm font-light text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Forgot password?
                </a>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <CardFooter className="p-0">
                <div className="w-full">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[var(--color-primary,_#0B63FF)] text-white hover:bg-[var(--color-secondary,_#1E3A8A)] rounded-md disabled:opacity-50"
                  >
                    {submitting ? "Logging in..." : "Login"}
                  </Button>

                  {/* credit */}
                  {/* <p className="mt-3 w-full text-center text-[11px] sm:text-xs text-slate-500/80 dark:text-slate-400/80">
                    SynTech-T5 x TTT Brother
                  </p> */}
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}