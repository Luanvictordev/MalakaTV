export default function LeagueCover({
  patch,
  name,
  date,
  image,
}: {
  patch: string;
  name: string;
  date: string;
  image?: string;
}) {
  const src = image || "/images/liga-3-30.jpg";

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink">
        <img
          src={src}
          alt={`Capa da liga ${name}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Path of Exile 1 · patch {patch}
          </p>
          <p className="mt-1 font-display text-xl font-extrabold tracking-tight text-ink">{name}</p>
        </div>
        <span className="badge badge-lime-solid">{date}</span>
      </div>
    </div>
  );
}
