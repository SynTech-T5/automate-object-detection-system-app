"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RotateCcw, ArrowLeft, Bug, Copy } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [copyOk, setCopyOk] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log for observability
    console.error(error);
  }, [error]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `${error.message}\n\n${error.stack ?? ""}`
      );
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1500);
    } catch {
      // ignore
    }
  }

  function handleRetry() {
    setRetrying(true);
    setTimeout(() => reset(), 150); // tiny delay for visual feedback
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-[var(--color-danger)] bg-[var(--color-danger-bg)]/50 dark:border-red-900/30"
    >
      {/* Accent line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-400 via-amber-400 to-red-400" />
      <div className="bg-white/80 p-6 sm:p-8 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--color-danger)]">
              Something went wrong
            </h2>
            <p className="mt-1 break-words text-sm text-neutral-700">
              {error.message || "An unexpected error occurred."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            <RotateCcw
              className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
              aria-hidden
            />
            {retrying ? "Retrying…" : "Try again"}
          </button>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Go back
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copyOk ? "Copied!" : "Copy details"}
          </button>

          <button
            onClick={() => setShowDetails((s) => !s)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-600 transition hover:text-neutral-800 dark:text-neutral-300"
          >
            <Bug className="h-4 w-4" aria-hidden />
            {showDetails ? "Hide details" : "Show details"}
          </button>
        </div>

        {showDetails && (
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-100 dark:bg-black/60">
            {error.stack || "No stack trace available."}
          </pre>
        )}
      </div>
    </div>
  );
}