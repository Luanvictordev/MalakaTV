export type DecodedAtlasTree = {
  hashes: string[];
  masteryEffects: Record<string, number>;
};

export type AtlasPayloadTarget =
  | { kind: "payload"; payload: string }
  | { kind: "poeplanner-short"; code: string };

const EMPTY_SEGMENTS = new Set([
  "",
  "atlas-skill-tree",
  "fullscreen-atlas-skill-tree",
  "atlas-tree",
  "atlas-tree2",
  "passive-skill-tree",
]);

function base64UrlToBytes(input: string): Uint8Array | null {
  const clean = input.trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!clean || !/^[A-Za-z0-9+/=]+$/.test(clean)) return null;
  const padLen = (4 - (clean.length % 4)) % 4;
  const padded = clean + "=".repeat(padLen);

  try {
    if (typeof atob === "function") {
      const bin = atob(padded);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    const buf = Buffer.from(padded, "base64");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  } catch {
    return null;
  }
}

export function extractAtlasPayloadFromUrl(input: string): AtlasPayloadTarget | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (!trimmed.includes("/") && !trimmed.includes("://")) {
    return EMPTY_SEGMENTS.has(trimmed.toLowerCase())
      ? null
      : { kind: "payload", payload: trimmed };
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);

    if (host.includes("poeplanner.com") && parts.length >= 2 && (parts[0] === "a" || parts[0] === "b")) {
      return { kind: "poeplanner-short", code: parts[1] };
    }

    const last = parts[parts.length - 1] ?? "";
    if (!last || EMPTY_SEGMENTS.has(last.toLowerCase())) return null;
    if (/^\d+\.\d+(\.\d+)?$/.test(last)) return null;

    return { kind: "payload", payload: last };
  } catch {
    const cleanPath = trimmed.split(/[?#]/)[0].replace(/\/+$/, "");
    const last = cleanPath.split("/").pop() ?? "";
    if (!last || EMPTY_SEGMENTS.has(last.toLowerCase())) return null;
    return { kind: "payload", payload: last };
  }
}

export function decodeAtlasTreePayload(payload: string): DecodedAtlasTree | null {
  const bytes = base64UrlToBytes(payload);
  if (!bytes || bytes.length < 7) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // 1. Formato Oficial GGG / PoEDB (Big-Endian)
  const beVersion = view.getUint32(0, false);
  if (beVersion >= 1 && beVersion <= 10) {
    let offset = 6; // 4 bytes version + 1 byte CharactersID + 1 byte Ascendancy/Descendancy
    const hashes: string[] = [];
    const masteryEffects: Record<string, number> = {};

    if (beVersion >= 7) {
      if (offset + 2 > bytes.length) return null;
      const count = view.getUint16(offset, false);
      offset += 2;
      for (let i = 0; i < count; i++) {
        if (offset + 4 > bytes.length) break;
        const hash = view.getUint16(offset, false);
        const flags = view.getUint16(offset + 2, false);
        offset += 4;
        hashes.push(String(hash));
        if (flags & 1) offset += 1;
        if (flags & 2) offset += 2;
      }
    } else if (beVersion >= 5) {
      if (offset + 1 > bytes.length) return null;
      const count = view.getUint8(offset);
      offset += 1;
      for (let i = 0; i < count; i++) {
        if (offset + 2 > bytes.length) break;
        hashes.push(String(view.getUint16(offset, false)));
        offset += 2;
      }
      if (offset < bytes.length) {
        const extCount = view.getUint8(offset);
        offset += 1 + extCount * 2;
      }
      if (offset < bytes.length) {
        const masteryCount = view.getUint8(offset);
        offset += 1;
        for (let i = 0; i < masteryCount; i++) {
          if (offset + 4 > bytes.length) break;
          const effectId = view.getUint16(offset, false);
          const nodeId = view.getUint16(offset + 2, false);
          offset += 4;
          masteryEffects[String(nodeId)] = effectId;
        }
      }
    } else {
      while (offset + 2 <= bytes.length) {
        hashes.push(String(view.getUint16(offset, false)));
        offset += 2;
      }
    }

    if (hashes.length === 0) return null;
    return {
      hashes: Array.from(new Set(hashes)),
      masteryEffects,
    };
  }

  // 2. Formato PoE Planner /atlas-tree/ (Little-Endian)
  const serVer = view.getUint16(0, true);
  const treeVer = view.getUint16(2, true);
  if (serVer >= 1 && serVer <= 10 && treeVer >= 1 && treeVer <= 200) {
    let offset = 4;
    if (serVer >= 5) {
      if (offset + 1 > bytes.length) return null;
      offset += 1; // isPoE2 flag
    }
    if (offset + 2 > bytes.length) return null;
    const count = view.getUint16(offset, true);
    offset += 2;
    if (count === 0 || offset + count * 2 > bytes.length) return null;

    const hashes: string[] = [];
    for (let i = 0; i < count; i++) {
      hashes.push(String(view.getUint16(offset, true)));
      offset += 2;
    }
    return {
      hashes: Array.from(new Set(hashes)),
      masteryEffects: {},
    };
  }

  return null;
}

export async function resolveAtlasTreeUrl(url: string): Promise<DecodedAtlasTree | null> {
  const target = extractAtlasPayloadFromUrl(url);
  if (!target) return null;

  if (target.kind === "payload") {
    return decodeAtlasTreePayload(target.payload);
  }

  try {
    const res = await fetch(`https://api.poeplanner.com/api/b/${encodeURIComponent(target.code)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim().replace(/^"|"$/g, "");
    return decodeAtlasTreePayload(text);
  } catch {
    return null;
  }
}
