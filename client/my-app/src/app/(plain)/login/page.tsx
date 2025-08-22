'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
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

      window.location.href = '/cameras';
    } catch (e: any) {
      setErr(e.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[var(--color-bg)] p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-5">
          <div className="flex items-center justify-center gap-3">
            {/* โลโก้ซ้าย */}
            <img src="/automate-object-detection-system-icon.png" alt="Logo" className="h-9 w-9" />
            {/* ไตเติลขวา (สองบรรทัด/สองสี) */}
            <div className="leading-tight">
              <div className="text-xl font-semibold text-[var(--color-secondary)]">
                Automate
              </div>
              <div className="text-sm font-medium text-[var(--color-primary)]">
                Object Detection System
              </div>
            </div>
          </div>
          {/* <CardDescription className="text-center">
            Sign in to your account
          </CardDescription> */}
          <label htmlFor="Login" className="text-[var(--color-primary)] font-bold">Login</label>
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
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100 text-sm font-light"
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
                  className="w-full rounded-md border px-3 py-2 pr-10 outline-none focus:ring focus:ring-blue-100 text-sm font-light"
                  required
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot ในบรรทัดเดียวกัน */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 select-none text-sm font-light" htmlFor="remember">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                Remember me
              </label>

              <a
                href="/forgot"
                className="text-sm underline-offset-4 hover:underline font-light"
              >
                Forgot password?
              </a>
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <CardFooter className="p-0">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] rounded-md disabled:opacity-50"
              >
                {submitting ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}