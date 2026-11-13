export default function GameLoading() {
  return (
    <div>
      <section className="border-b border-ink/10 bg-canvas">
        <div className="mx-auto max-w-[1200px] animate-pulse px-5 py-8 sm:py-12">
          <div className="h-6 w-28 rounded-full bg-ink/10" />
          <div className="mt-4 h-12 w-72 rounded-2xl bg-ink/10" />
          <div className="mt-3 h-5 w-full max-w-xl rounded-xl bg-ink/10" />
          <div className="mt-6 flex gap-2">
            <div className="h-9 w-28 rounded-3xl bg-ink/10" />
            <div className="h-9 w-24 rounded-3xl bg-ink/10" />
            <div className="h-9 w-24 rounded-3xl bg-ink/10" />
          </div>
        </div>
      </section>

      <section className="bg-canvas-soft py-12">
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="card animate-pulse p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="h-12 flex-1 rounded-xl bg-ink/10" />
              <div className="h-12 sm:w-56 rounded-xl bg-ink/10" />
            </div>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-ink/10" />
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse p-2.5">
                <div className="aspect-video rounded-2xl bg-ink/10" />
                <div className="space-y-2 p-4">
                  <div className="h-5 w-3/4 rounded bg-ink/10" />
                  <div className="h-4 w-full rounded bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
