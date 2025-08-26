'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = { className?: string };

export default function LogoutButton({ className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      // router.replace('/login'); router.refresh();
      window.location.href = '/login';
    } catch (_) {
      // handle error if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={loading}
          title="Log out"
          className={`h-auto px-5 py-2 border shadow-sm hover:bg-gray-50 disabled:opacity-60 ${className}`}
        >
          {loading ? 'Logging out…' : 'Logout'}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out and redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end gap-2">
          <AlertDialogCancel
            disabled={loading}
            className="h-auto px-5 py-2 border border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLogout}
            disabled={loading}
            className="h-auto px-5 py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
          >
            {loading ? 'Logging out…' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}