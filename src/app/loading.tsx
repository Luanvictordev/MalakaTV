export default function HomeLoading() {
  return (
    <div className="bg-canvas-soft">
      <section className="mx-auto grid max-w-[1200px] items-center gap-6 px-5 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-full bg-ink/10" />
            <div className="h-6 w-20 rounded-full bg-ink/10" />
          </div>
          <div className="h-14 w-4/5 rounded-2xl bg-ink/10" />
          <div className="h-5 w-3/4 rounded-xl bg-ink/10" />
          <div className="flex gap-3 pt-2">
            <div className="h-12 w-40 rounded-3xl bg-ink/10" />
            <div className="h-12 w-40 rounded-3xl bg-ink/10" />
          </div>
        </div>
        <div className="card animate-pulse overflow-hidden">
          <div className="aspect-[16/9] w-full bg-ink/10" />
          <div className="flex items-center justify-between px-5 py-4">
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-ink/10" />
              <div className="h-6 w-48 rounded bg-ink/10" />
            </div>
            <div className="h-6 w-20 rounded-full bg-ink/10" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:py-16">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-ink/10" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <div className="card animate-pulse p-2.5">
            <div className="aspect-[16/9] rounded-2xl bg-ink/10" />
            <div className="space-y-2 p-4">
              <div className="h-7 w-2/3 rounded bg-ink/10" />
              <div className="h-4 w-full rounded bg-ink/10" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card flex animate-pulse items-center gap-3 p-2.5">
                <div className="aspect-video w-28 shrink-0 rounded-2xl bg-ink/10" />
                <div className="flex-1 space-y-2 pr-2">
                  <div className="h-3 w-20 rounded bg-ink/10" />
                  <div className="h-4 w-3/4 rounded bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
