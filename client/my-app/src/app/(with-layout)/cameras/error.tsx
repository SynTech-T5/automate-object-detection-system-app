"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 rounded-xl border border-red-200 bg-[var(--color-danger-bg)] text-[var(--color-secondary)]">
      <p className="font-semibold">โหลดไม่สำเร็จ</p>
      <p className="text-sm opacity-80 mt-1">{error.message}</p>
      <button
        onClick={reset}
        className="mt-3 inline-flex items-center rounded-lg border px-3 py-1 text-sm
                   border-[var(--color-danger)] text-[var(--color-danger)]
                   hover:bg-white/60"
      >
        ลองใหม่
      </button>
    </div>
  );
}
