export default function FerramentasLoading() {
  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[1200px] animate-pulse px-5 py-12">
        <div className="h-4 w-24 rounded bg-ink/10" />
        <div className="mt-3 h-12 w-80 rounded-2xl bg-ink/10" />
        <div className="mt-3 h-5 w-full max-w-xl rounded-xl bg-ink/10" />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-12 max-w-md flex-1 rounded-xl bg-ink/10" />
          <div className="flex gap-2">
            <div className="h-8 w-20 rounded-full bg-ink/10" />
            <div className="h-8 w-20 rounded-full bg-ink/10" />
            <div className="h-8 w-20 rounded-full bg-ink/10" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-ink/10" />
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-ink/10" />
                <div className="h-5 w-36 rounded bg-ink/10" />
              </div>
              <div className="mt-3 h-4 w-full rounded bg-ink/10" />
              <div className="mt-1.5 h-4 w-2/3 rounded bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
