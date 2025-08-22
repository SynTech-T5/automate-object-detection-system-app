'use client';

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface User {
  username: string;
  email: string;
  password: string;
  role: "admin" | "security officer" | "staff";
}

export default function Page() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string>("");

  async function postUser(payload: User): Promise<User> {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to Register");
    }
    return res.json();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    const form = e.currentTarget as typeof e.currentTarget & {
      username: { value: string };
      email: { value: string };
      password: { value: string };
      role: { value: "admin" | "security officer" | "staff" };
    };

    try {
      await postUser({
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        role: form.role.value,
      });
      setOpen(false); // ปิดโมดัลเมื่อสำเร็จ
      window.location.href = "/cameras";
    } catch (e: any) {
      setErr(e.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>Form Template</h1>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button onClick={() => setOpen(true)} className="bg-[#0077FF] text-white hover:bg-[#0063d6]">
            New User
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="!top-[40%] !-translate-y-[40%]">
          <form id="userForm" onSubmit={onSubmit} className="space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Register</AlertDialogTitle>
              <AlertDialogDescription>Fill in the details and click Register.</AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-3">
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  required
                  placeholder="Enter your username"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-1">
                {/* ✅ แก้ htmlFor ให้ตรงกับ id */}
                <label className="text-sm font-medium" htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  defaultValue="staff"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring focus:ring-blue-100"
                >
                  <option>admin</option>
                  <option>security officer</option>
                  <option>staff</option>
                </select>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting} className="border-gray-300 hover:bg-gray-50">
                Cancel
              </AlertDialogCancel>

              {/* ✅ ใช้ปุ่มธรรมดาเพื่อไม่ให้โมดัลปิดเองก่อน submit สำเร็จ */}
              <Button
                type="submit"
                form="userForm"
                disabled={submitting}
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] px-4 py-2 rounded-md disabled:opacity-50"
              >
                {submitting ? "Registering…" : "Register"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}