import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main
      className="
        relative isolate min-h-[100dvh] overflow-hidden
        bg-gradient-to-b from-[#F0F7FF] via-[#F6FAFF] to-[#EEF2FF]
        dark:from-[#0B1220] dark:via-[#0A1020] dark:to-[#0A0F1E]
        [--spot:40rem] sm:[--spot:48rem] lg:[--spot:56rem]
      "
    >
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-[calc(var(--spot)/2)] -left-[calc(var(--spot)/2)] h-[var(--spot)] w-[var(--spot)] rounded-full bg-blue-300/40 blur-3xl dark:bg-blue-900/30" />
        <div className="absolute -bottom-[calc(var(--spot)/2)] -right-[calc(var(--spot)/2)] h-[var(--spot)] w-[var(--spot)] rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-900/30" />
      </div>

      {/* Top nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/automate-object-detection-system-icon.png"
            alt="App logo"
            width={28}
            height={28}
            className="rounded"
            priority
          />
          <span className="text-sm font-semibold tracking-tight text-[var(--color-secondary)]">
            Automate <span className="text-[var(--color-primary,_#0B63FF)]">Object Detection System</span>
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-white
                       bg-[var(--color-primary,_#0B63FF)] hover:bg-[var(--color-secondary,_#1E3A8A)]"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid min-h-[70vh] w-full max-w-6xl place-items-center px-6 py-10">
        <div className="text-center">
          <p className="mb-3 text-xs tracking-widest text-blue-600/90 dark:text-blue-400/90">
            AI-Powered CCTV
          </p>

          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
            Automate Object Detection System
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Real-time alerts, camera management, and clean analytics — all in one sleek dashboard.
          </p>

          {/* Decorative line */}
          <div
            aria-hidden
            className="mx-auto mt-10 h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"
          />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Real-time Alerts"
            desc="Instant notifications with clear severity to keep you ahead of incidents."
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <FeatureCard
            title="Camera Management"
            desc="Organize cameras, statuses, and health in a streamlined interface."
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d="M3 7h13l3 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm5 10h8M7 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          <FeatureCard
            title="Analytics & Trends"
            desc="Clean charts for daily activity and severity breakdowns."
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d="M3 3v18h18M7 15l4-4 3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-slate-500/80 dark:text-slate-400/80">
            © {new Date().getFullYear()} Automate Object Detection System
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500/80 dark:text-slate-400/80">
            SynTech-T5 x TTT Brother
          </p>
        </div>
      </footer>
    </main>
  );
}

/* Lightweight Feature Card (server-safe) */
function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
        group relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm
        hover:shadow-md transition
        dark:bg-slate-900/60 dark:border-slate-800/70
      "
    >
      <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-full bg-white ring-2 ring-blue-100 dark:bg-slate-900 dark:ring-blue-900/40 text-[var(--color-primary,_#0B63FF)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}