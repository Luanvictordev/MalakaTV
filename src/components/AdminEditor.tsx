"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collections, siteFields, type Field, type CollectionKey } from "@/lib/adminSchema";

type Row = Record<string, unknown>;
type Tab = CollectionKey | "site";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inputClass = "field";

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
    return (
      <div>
        <Label>{field.label}</Label>
        <input
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
          placeholder={field.placeholder}
          className={inputClass}
        />
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
    return (
      <div>
        <Label>{field.label}</Label>
        <select
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
  const [data, setData] = useState(initial);
  const [editing, setEditing] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const collection = collections.find((item) => item.key === tab);
  const rows = collection ? (data[collection.key] as Row[]) : [];

  const titleOf = useMemo(
    () => (row: Row) => String(row[collection?.titleKey ?? ""] ?? "(sem título)"),
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
  }

  function updateSite(key: string, value: unknown) {
    setData({ ...data, site: { ...data.site, [key]: value } });
  }

  function move(index: number, direction: -1 | 1) {
    if (!collection) return;
    const list = [...(data[collection.key] as Row[])];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setData({ ...data, [collection.key]: list });
    setEditing(target);
  }

  function remove(index: number) {
    if (!collection) return;
    if (!window.confirm("Apagar esse item? Depois clique em Salvar.")) return;
    const list = (data[collection.key] as Row[]).filter((_, position) => position !== index);
    setData({ ...data, [collection.key]: list });
    setEditing(null);
  }

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
      active ? "bg-ink text-canvas" : "bg-canvas-soft text-body hover:bg-primary-pale hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {collections.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setTab(item.key);
              setEditing(null);
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
            setStatus("");
          }}
          className={tabClass(tab === "site")}
        >
          Textos do site
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="btn btn-primary btn-sm disabled:opacity-50">
          {busy ? "Salvando…" : "Salvar"}
        </button>
        {status ? <span className="text-xs font-semibold text-positive-deep">{status}</span> : null}
      </div>

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
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="card-soft p-4">
            <button
              type="button"
              onClick={() => {
                if (!collection) return;
                const list = [...(data[collection.key] as Row[]), collection.create()];
                setData({ ...data, [collection.key]: list });
                setEditing(list.length - 1);
              }}
              className="mb-3 w-full rounded-xl border border-ink/15 bg-canvas px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-primary-pale"
            >
              + adicionar {collection?.label.toLowerCase()}
            </button>

            <ul className="space-y-1.5">
              {rows.map((row, index) => (
                <li
                  key={`${String(row.slug ?? row.name ?? index)}-${index}`}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
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
                    onClick={() => move(index, -1)}
                    className="text-xs text-mute hover:text-ink"
                    aria-label="subir"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="text-xs text-mute hover:text-ink"
                    aria-label="descer"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-xs text-mute hover:text-[#a72027]"
                    aria-label="apagar"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-soft p-5">
            {collection && editing !== null && rows[editing] ? (
              <div className="grid gap-4">
                {collection.fields.map((field) => (
                  <FieldInput
                    key={`${editing}-${field.key}`}
                    field={field}
                    value={rows[editing][field.key]}
                    onChange={(value) => updateRow(editing, { [field.key]: value })}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-body">
                Escolha um item na lista (ou adicione um novo) pra editar. Não esqueça de clicar em
                Salvar no topo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
