export default function LeagueCover({
  patch,
  name,
  date,
  image,
  gameName = "Path of Exile 1",
}: {
  patch: string;
  name: string;
  date: string;
  image?: string;
  gameName?: string;
}) {
  const src = image || "/images/liga-3-30.jpg";

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-chrome lg:aspect-auto lg:min-h-[220px] lg:flex-1">
        <img
          src={src}
          alt={`Capa da liga ${name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            {gameName}
            {patch ? ` · patch ${patch}` : ""}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink">{name}</p>
        </div>
        <span className="badge badge-lime-solid">{date}</span>
      </div>
    </div>
  );
}
