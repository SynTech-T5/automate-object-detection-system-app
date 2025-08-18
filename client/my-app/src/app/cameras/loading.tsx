export default function Loading() {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-[var(--color-softGray)] bg-white p-4"
          >
            {/* media skeleton */}
            <div className="aspect-video rounded-md bg-[var(--color-softGray)] animate-pulse" />
            {/* text skeleton */}
            <div className="mt-4 space-y-2">
              <div className="h-5 w-3/5 rounded bg-[var(--color-softGray)] animate-pulse" />
              <div className="h-4 w-2/5 rounded bg-[var(--color-softGray)] animate-pulse" />
            </div>
            {/* buttons skeleton */}
            <div className="mt-4 grid grid-cols-4 gap-px">
              {Array.from({ length: 4 }).map((__, j) => (
                <div
                  key={j}
                  className="h-9 rounded bg-[var(--color-softGray)] animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  