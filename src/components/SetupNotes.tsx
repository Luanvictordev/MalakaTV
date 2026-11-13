import { AlertTriangle, Lightbulb } from "lucide-react";

type Block =
  | { type: "heading"; text: string }
  | { type: "callout"; variant: "tip" | "warn"; label: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

const TIP_RE = /^(dica|tip)\s*:\s*(.+)$/i;
const WARN_RE = /^(aten[çc][ãa]o|aviso|importante|cuidado)\s*:\s*(.+)$/i;
const MD_HEADING_RE = /^#{1,3}\s+(.+)$/;
const UL_RE = /^[-*•]\s+(.+)$/;
const OL_RE = /^\d+[.)]\s+(.+)$/;

function isColonHeading(line: string): boolean {
  if (!line.endsWith(":") || line.length > 64) return false;
  if (/^https?:/i.test(line)) return false;
  if (TIP_RE.test(`${line} x`) || WARN_RE.test(`${line} x`)) return false;
  return true;
}

function parseSetupNotes(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let ulBuffer: string[] = [];
  let olBuffer: string[] = [];
  let pBuffer: string[] = [];

  const flushLists = () => {
    if (ulBuffer.length > 0) {
      blocks.push({ type: "ul", items: ulBuffer });
      ulBuffer = [];
    }
    if (olBuffer.length > 0) {
      blocks.push({ type: "ol", items: olBuffer });
      olBuffer = [];
    }
  };

  const flushParagraph = () => {
    if (pBuffer.length > 0) {
      blocks.push({ type: "p", text: pBuffer.join("\n") });
      pBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      flushParagraph();
      continue;
    }

    const tipMatch = line.match(TIP_RE);
    if (tipMatch) {
      flushLists();
      flushParagraph();
      blocks.push({ type: "callout", variant: "tip", label: tipMatch[1], text: tipMatch[2] });
      continue;
    }

    const warnMatch = line.match(WARN_RE);
    if (warnMatch) {
      flushLists();
      flushParagraph();
      blocks.push({ type: "callout", variant: "warn", label: warnMatch[1], text: warnMatch[2] });
      continue;
    }

    const mdHeading = line.match(MD_HEADING_RE);
    if (mdHeading) {
      flushLists();
      flushParagraph();
      blocks.push({ type: "heading", text: mdHeading[1].trim() });
      continue;
    }

    if (isColonHeading(line)) {
      flushLists();
      flushParagraph();
      blocks.push({ type: "heading", text: line.slice(0, -1).trim() });
      continue;
    }

    const ulMatch = line.match(UL_RE);
    if (ulMatch) {
      flushParagraph();
      if (olBuffer.length > 0) {
        blocks.push({ type: "ol", items: olBuffer });
        olBuffer = [];
      }
      ulBuffer.push(ulMatch[1]);
      continue;
    }

    const olMatch = line.match(OL_RE);
    if (olMatch) {
      flushParagraph();
      if (ulBuffer.length > 0) {
        blocks.push({ type: "ul", items: ulBuffer });
        ulBuffer = [];
      }
      olBuffer.push(olMatch[1]);
      continue;
    }

    flushLists();
    pBuffer.push(line);
  }

  flushLists();
  flushParagraph();
  return blocks;
}

export default function SetupNotes({ text }: { text: string }) {
  const blocks = parseSetupNotes(text);

  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-body">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={index}
              className="pt-2 font-display text-base font-extrabold tracking-tight text-ink first:pt-0"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "callout") {
          const isTip = block.variant === "tip";
          return (
            <div
              key={index}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                isTip
                  ? "border-primary/30 bg-primary-pale/50 text-ink"
                  : "border-amber-500/30 bg-amber-500/10 text-ink"
              }`}
            >
              {isTip ? (
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              )}
              <p className="text-sm leading-relaxed">
                <span className="font-display font-bold capitalize">{block.label}: </span>
                <span className="text-body">{block.text}</span>
              </p>
            </div>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={index} className="space-y-2.5">
              {block.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="flex items-start gap-3 rounded-xl border border-ink/8 bg-canvas px-3.5 py-2.5"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chrome font-display text-[11px] font-extrabold text-primary">
                    {itemIdx + 1}
                  </span>
                  <span className="text-ink">{item}</span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
