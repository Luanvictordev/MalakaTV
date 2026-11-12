"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { collections, siteFields, type Field, type CollectionKey } from "@/lib/adminSchema";
import { slugify, youtubeThumb } from "@/lib/format";

type Row = Record<string, unknown>;
type Tab = CollectionKey | "site";

const ASCENDANCY_OPTIONS = [
  "Assassin",
  "Berserker",
  "Champion",
  "Chieftain",
  "Deadeye",
  "Elementalist",
  "Gladiator",
  "Guardian",
  "Hierophant",
  "Inquisitor",
  "Juggernaut",
  "Necromancer",
  "Occultist",
  "Pathfinder",
  "Saboteur",
  "Slayer",
  "Trickster",
  "Warden",
  "Ascendant",
  "Mercenary",
];

const QUICK_TAGS = [
  "League Starter",
  "Melee",
  "Spell",
  "Bow",
  "Minion",
  "Tank",
  "Boss",
  "Mapa",
  "DOT",
  "Ignite",
  "Cold",
  "Barata",
  "Iniciante",
  "3.30",
];

const inputClass = "field";

function extractYoutubeId(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\//, "").split("/")[0] || value;
    }
    const v = url.searchParams.get("v");
    if (v) return v;
    const parts = url.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => part === "shorts" || part === "embed" || part === "live");
    if (marker >= 0 && parts[marker + 1]) return parts[marker + 1];
  } catch {
    // Já é um ID ou texto parcial
  }
  return value;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-semibold text-body">{children}</span>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-mute">{children}</p>;
}

function ImageField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex flex-wrap items-start gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-20 w-32 rounded-xl border border-ink/10 object-cover" />
      ) : (
        <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-dashed border-ink/20 text-[11px] text-mute">
          sem foto
        </div>
      )}
      <div className="flex-1 space-y-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/uploads/minha-foto.png"
          className={inputClass}
        />
        <div className="flex items-center gap-2">
          <label className="btn btn-secondary btn-sm cursor-pointer">
            {busy ? "enviando…" : "Enviar imagem"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  const form = new FormData();
                  form.append("file", file);
                  const response = await fetch("/api/admin/upload", { method: "POST", body: form });
                  const json = await response.json();
                  if (!response.ok) throw new Error(json.error || "Falha no upload");
                  onChange(json.url);
                } catch (uploadError) {
                  setError(uploadError instanceof Error ? uploadError.message : "Falha no upload");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-semibold text-body hover:text-ink hover:underline"
            >
              remover
            </button>
          ) : null}
        </div>
        {error ? <p className="text-xs text-[#a72027]">{error}</p> : null}
      </div>
    </div>
  );
}

function TagsField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((item) => item !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const addDraft = () => {
    const clean = draft.trim();
    if (!clean) return;
    if (!value.includes(clean)) onChange([...value, clean]);
    setDraft("");
  };

  const customTags = value.filter((tag) => !QUICK_TAGS.includes(tag));

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_TAGS.map((tag) => {
          const active = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active ? "bg-ink text-primary" : "bg-canvas text-body hover:bg-primary-pale hover:text-ink"
              }`}
            >
              {tag}
            </button>
          );
        })}
        {customTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-primary"
          >
            {tag}
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addDraft();
            }
          }}
          placeholder="Outra tag (Enter pra adicionar)…"
          className={inputClass}
        />
        <button type="button" onClick={addDraft} className="btn btn-secondary btn-sm shrink-0">
          Adicionar
        </button>
      </div>
    </div>
  );
}

function YoutubeField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        value={value}
        onChange={(event) => onChange(extractYoutubeId(event.target.value))}
        placeholder={placeholder}
        className={inputClass}
      />
      {value ? (
        <div className="flex items-center gap-3 rounded-xl bg-canvas p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youtubeThumb(value)}
            alt=""
            className="h-12 w-20 rounded-lg object-cover bg-canvas-soft"
          />
          <div className="min-w-0 text-xs">
            <p className="font-semibold text-ink">Thumb carregada</p>
            <p className="truncate text-mute">ID: {value}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === "textarea") {
    return (
      <div>
        <Label>{field.label}</Label>
        <textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={inputClass}
        />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  if (field.type === "tags") {
    const tags = Array.isArray(value) ? value.map(String) : [];
    return (
      <div>
        <Label>{field.label}</Label>
        <TagsField value={tags} onChange={onChange} />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  if (field.type === "youtube") {
    return (
      <div>
        <Label>{field.label}</Label>
        <YoutubeField value={String(value ?? "")} placeholder={field.placeholder} onChange={onChange} />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  if (field.type === "ascendancy") {
    const current = String(value ?? "");
    const list = current && !ASCENDANCY_OPTIONS.includes(current) ? [current, ...ASCENDANCY_OPTIONS] : ASCENDANCY_OPTIONS;
    const options = [
      { value: "", label: "Sem classe definida" },
      ...list.map((option) => ({ value: option, label: option })),
    ];
    return (
      <div>
        <Label>{field.label}</Label>
        <CustomSelect value={current} options={options} onChange={onChange} placeholder="Sem classe definida" />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  if (field.type === "bool") {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-canvas px-4 py-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-[#9fe870]"
        />
        <span className="text-sm font-medium text-ink">{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    const options = (field.options ?? []).map((option) => ({ value: option, label: option }));
    return (
      <div>
        <Label>{field.label}</Label>
        <CustomSelect value={String(value ?? "")} options={options} onChange={onChange} />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  if (field.type === "image") {
    return (
      <div>
        <Label>{field.label}</Label>
        <ImageField value={String(value ?? "")} onChange={onChange} />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  if (field.type === "spotlight") {
    const rows = Array.isArray(value) ? (value as { label?: string; url?: string; description?: string }[]) : [];
    const text = rows.map((row) => [row.label, row.url, row.description].join(" | ")).join("\n");
    return (
      <div>
        <Label>{field.label}</Label>
        <textarea
          defaultValue={text}
          rows={4}
          onChange={(event) => {
            const parsed = event.target.value
              .split("\n")
              .map((line) => line.split("|").map((part) => part.trim()))
              .filter((parts) => parts[0])
              .map((parts) => ({ label: parts[0] ?? "", url: parts[1] ?? "", description: parts[2] ?? "" }));
            onChange(parsed);
          }}
          className={inputClass}
        />
        {field.hint ? <Hint>{field.hint}</Hint> : null}
      </div>
    );
  }

  return (
    <div>
      <Label>{field.label}</Label>
      <input
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className={inputClass}
      />
      {field.hint ? <Hint>{field.hint}</Hint> : null}
    </div>
  );
}

export default function AdminEditor({
  initial,
}: {
  initial: { games: Row[]; builds: Row[]; guias: Row[]; links: Row[]; site: Row };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("builds");
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const [data, setData] = useState(initial);
  const [editing, setEditing] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const collection = collections.find((item) => item.key === tab);
  const rows = collection ? (data[collection.key] as Row[]) : [];

  const visibleIndices = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => {
        if (!term) return true;
        return [row[collection?.titleKey ?? ""], row[collection?.subtitleKey ?? ""]]
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
  }, [rows, filter, collection]);

  const titleOf = useMemo(
    () => (row: Row) => String(row[collection?.titleKey ?? ""] ?? "") || "(sem título)",
    [collection],
  );

  async function save() {
    setBusy(true);
    setStatus("");
    try {
      const body =
        tab === "site" ? { collection: "site", data: data.site } : { collection: tab, data: data[tab] };
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Falha ao salvar");
      setSavedSnapshot(data);
      setDirty(false);
      setStatus(
        json.storage === "supabase"
          ? "Salvo no Supabase — já está no ar."
          : "Salvo nos arquivos locais. Faça commit pra publicar.",
      );
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }

  function updateRow(index: number, patch: Row) {
    if (!collection) return;
    const list = [...(data[collection.key] as Row[])];
    const next = { ...list[index], ...patch };
    if (typeof patch.name === "string" && !list[index].slug) next.slug = slugify(patch.name);
    if (typeof patch.title === "string" && !list[index].slug) next.slug = slugify(patch.title);
    list[index] = next;
    setData({ ...data, [collection.key]: list });
    setDirty(true);
  }

  function discard() {
    setData(savedSnapshot);
    setDirty(false);
    setStatus("");
    if (collection && editing !== null && editing >= (savedSnapshot[collection.key] as Row[]).length) {
      setEditing(null);
    }
  }

  function updateSite(key: string, value: unknown) {
    setData({ ...data, site: { ...data.site, [key]: value } });
    setDirty(true);
  }

  function move(index: number, direction: -1 | 1) {
    if (!collection) return;
    const list = [...(data[collection.key] as Row[])];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setData({ ...data, [collection.key]: list });
    setEditing(target);
    setDirty(true);
  }

  function duplicate(index: number) {
    if (!collection) return;
    const list = [...(data[collection.key] as Row[])];
    const source = list[index];
    const titleKey = collection.titleKey;
    const copy: Row = {
      ...source,
      [titleKey]: `${String(source[titleKey] ?? "")} (cópia)`.trim(),
      slug: source.slug ? `${String(source.slug)}-copia` : "",
    };
    list.splice(index + 1, 0, copy);
    setData({ ...data, [collection.key]: list });
    setEditing(index + 1);
    setDirty(true);
  }

  function remove(index: number) {
    if (!collection) return;
    if (!window.confirm("Apagar esse item? Depois clique em Salvar.")) return;
    const list = (data[collection.key] as Row[]).filter((_, position) => position !== index);
    setData({ ...data, [collection.key]: list });
    setEditing(null);
    setDirty(true);
  }

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
      active ? "bg-ink text-canvas" : "bg-canvas-soft text-body hover:bg-primary-pale hover:text-ink"
    }`;

  const primaryFields = collection ? collection.fields.filter((f) => !f.advanced) : [];
  const advancedFields = collection ? collection.fields.filter((f) => f.advanced) : [];

  return (
    <div className="pb-16">
      <div className="flex flex-wrap gap-2">
        {collections.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setEditing(null);
              setFilter("");
              setStatus("");
            }}
            className={tabClass(tab === item.key)}
          >
            {item.label} ({data[item.key].length})
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setTab("site");
            setEditing(null);
            setFilter("");
            setStatus("");
          }}
          className={tabClass(tab === "site")}
        >
          Textos do site
        </button>
      </div>

      {status ? (
        <p className="mt-4 text-xs font-semibold text-positive-deep">{status}</p>
      ) : null}

      {tab === "site" ? (
        <div className="card-soft mt-5 grid gap-4 p-5 sm:grid-cols-2">
          {siteFields.map((field) => (
            <div
              key={field.key}
              className={field.type === "textarea" || field.type === "spotlight" ? "sm:col-span-2" : ""}
            >
              <FieldInput
                field={field}
                value={data.site[field.key]}
                onChange={(value) => updateSite(field.key, value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="card-soft p-4">
            <div className="mb-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!collection) return;
                  const list = [collection.create(), ...(data[collection.key] as Row[])];
                  setData({ ...data, [collection.key]: list });
                  setEditing(0);
                  setFilter("");
                  setDirty(true);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-canvas px-3 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-primary-pale"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Adicionar {collection?.label.toLowerCase()}
              </button>

              {rows.length > 5 ? (
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute"
                    aria-hidden="true"
                  />
                  <input
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Buscar na lista…"
                    className="w-full rounded-xl border border-ink/15 bg-canvas py-2 pl-8 pr-3 text-xs text-ink outline-none focus:border-ink"
                  />
                </div>
              ) : null}
            </div>

            <ul className="space-y-1.5">
              {visibleIndices.map(({ row, index }) => (
                <li
                  key={`${String(row.slug ?? row.name ?? index)}-${index}`}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 transition-colors ${
                    editing === index
                      ? "border-ink/40 bg-primary-pale"
                      : "border-transparent bg-canvas hover:border-ink/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setEditing(index)}
                    className="flex-1 truncate text-left text-sm font-medium text-ink"
                  >
                    {titleOf(row)}
                    <span className="ml-2 text-[11px] text-mute">
                      {String(row[collection?.subtitleKey ?? ""] ?? "")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicate(index)}
                    className="p-1 text-mute hover:text-ink"
                    aria-label="duplicar"
                    title="Duplicar"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    className="p-1 text-mute hover:text-ink"
                    aria-label="subir"
                    title="Subir"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="p-1 text-mute hover:text-ink"
                    aria-label="descer"
                    title="Descer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-mute hover:text-[#a72027]"
                    aria-label="apagar"
                    title="Apagar"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-soft p-5">
            {collection && editing !== null && rows[editing] ? (
              <div className="grid gap-4">
                {primaryFields.map((field) => (
                  <FieldInput
                    key={`${editing}-${field.key}`}
                    field={field}
                    value={rows[editing][field.key]}
                    onChange={(value) => updateRow(editing, { [field.key]: value })}
                  />
                ))}

                {advancedFields.length > 0 ? (
                  <details className="rounded-2xl border border-ink/10 bg-canvas/60 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-body">
                      <span>Mais opções (opcional)</span>
                      <ChevronDown className="h-4 w-4 text-mute" aria-hidden="true" />
                    </summary>
                    <div className="mt-4 grid gap-4">
                      {advancedFields.map((field) => (
                        <FieldInput
                          key={`${editing}-${field.key}`}
                          field={field}
                          value={rows[editing][field.key]}
                          onChange={(value) => updateRow(editing, { [field.key]: value })}
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-body">
                Escolha um item na lista (ou adicione um novo) pra editar.
              </p>
            )}
          </div>
        </div>
      )}

      {dirty ? (
        <div
          role="dialog"
          aria-label="Alterações não salvas"
          className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex-wrap items-center justify-between gap-4 rounded-2xl border border-canvas/15 bg-ink px-6 py-4 text-canvas shadow-[0_24px_60px_-12px_rgba(14,15,12,0.55)]"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-canvas">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-warning" />
            Você tem alterações não salvas
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={discard}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-3xl px-4 text-sm font-semibold text-canvas/80 transition-colors hover:bg-canvas/10 hover:text-canvas disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Desfazer
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="btn btn-primary h-10 px-5 text-sm disabled:opacity-50"
            >
              {busy ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
