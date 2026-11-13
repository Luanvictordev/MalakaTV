import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { ImageResponse } from "next/og";
import { resolveAtlasTreeUrl } from "@/lib/atlasTree";
import bundledAtlasTree from "../../../../../public/atlas/atlas-tree-3.30.json";

type RawNode = {
  isNotable?: boolean;
  isKeystone?: boolean;
  isMastery?: boolean;
  isWormhole?: boolean;
  ascendancyName?: string;
  name?: string;
  stats?: string[];
  group: number;
  orbit: number;
  orbitIndex: number;
  out?: string[];
};

type RawGroup = {
  x: number;
  y: number;
  nodes: string[];
};

type RawAtlasJson = {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  constants: {
    skillsPerOrbit: number[];
    orbitRadii: number[];
  };
  groups: Record<string, RawGroup>;
  nodes: Record<string, RawNode>;
};

type ThumbNode = {
  id: string;
  x: number;
  y: number;
  kind: "normal" | "notable" | "keystone";
};

type ThumbConnection = {
  a: string;
  b: string;
  pathSegment: string;
};

type CachedAtlasGeometry = {
  nodes: ThumbNode[];
  nodesById: Record<string, ThumbNode>;
  connections: ThumbConnection[];
  baseHashes: string[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
};

let cachedGeometry: CachedAtlasGeometry | null = null;

function buildOrbitAngles(skillsPerOrbit: number[]): number[][] {
  return skillsPerOrbit.map((count) => {
    let degrees: number[];
    if (count === 16) {
      degrees = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    } else if (count === 40) {
      degrees = [
        0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 135, 140, 150, 160, 170,
        180, 190, 200, 210, 220, 225, 230, 240, 250, 260, 270, 280, 290, 300, 310, 315, 320, 330,
        340, 350,
      ];
    } else {
      degrees = Array.from({ length: count }, (_, i) => (360 * i) / count);
    }
    return degrees.map((deg) => (deg * Math.PI) / 180);
  });
}

function getGeometry(): CachedAtlasGeometry {
  if (cachedGeometry) return cachedGeometry;

  let raw: RawAtlasJson;
  try {
    const jsonPath = path.join(process.cwd(), "public", "atlas", "atlas-tree-3.30.json");
    raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as RawAtlasJson;
  } catch {
    raw = bundledAtlasTree as unknown as RawAtlasJson;
  }

  const orbitAngles = buildOrbitAngles(raw.constants.skillsPerOrbit);
  const orbitRadii = raw.constants.orbitRadii;
  const skillsPerOrbit = raw.constants.skillsPerOrbit;

  const rawPos: Record<string, { x: number; y: number }> = {};
  for (const group of Object.values(raw.groups)) {
    for (const nodeId of group.nodes) {
      const node = raw.nodes[nodeId];
      if (!node) continue;
      const angle = orbitAngles[node.orbit]?.[node.orbitIndex] ?? 0;
      const radius = orbitRadii[node.orbit] ?? 0;
      rawPos[nodeId] = {
        x: Math.round(group.x + radius * Math.sin(angle)),
        y: Math.round(group.y - radius * Math.cos(angle)),
      };
    }
  }

  let minX = raw.min_x;
  let maxX = raw.max_x;
  let minY = raw.min_y;
  let maxY = raw.max_y;
  for (const pos of Object.values(rawPos)) {
    if (pos.x < minX) minX = pos.x;
    if (pos.x > maxX) maxX = pos.x;
    if (pos.y < minY) minY = pos.y;
    if (pos.y > maxY) maxY = pos.y;
  }

  const seen = new Set<string>();
  const connections: ThumbConnection[] = [];

  for (const [id, node] of Object.entries(raw.nodes)) {
    if (id === "root" || node.isWormhole || node.isMastery) continue;
    const posU = rawPos[id];
    if (!posU) continue;

    for (const targetId of node.out ?? []) {
      const target = raw.nodes[targetId];
      const posG = rawPos[targetId];
      if (!target || !posG || target.isMastery) continue;
      if (target.ascendancyName !== node.ascendancyName) continue;

      const na = Number.parseInt(id, 10);
      const nb = Number.parseInt(targetId, 10);
      const cid = na > nb ? `${nb}-${na}` : `${na}-${nb}`;
      if (seen.has(cid)) continue;
      seen.add(cid);

      if (node.group === target.group && node.orbit === target.orbit) {
        const r = orbitRadii[node.orbit] ?? 0;
        const count = skillsPerOrbit[node.orbit] ?? 1;
        const diff = (node.orbitIndex - target.orbitIndex + count) % count;
        const sweep = diff > count / 2 ? 1 : 0;
        connections.push({
          a: id,
          b: targetId,
          pathSegment: `M ${posU.x} ${posU.y} A ${r} ${r} 0 0 ${sweep} ${posG.x} ${posG.y}`,
        });
      } else {
        connections.push({
          a: id,
          b: targetId,
          pathSegment: `M ${posU.x} ${posU.y} L ${posG.x} ${posG.y}`,
        });
      }
    }
  }

  const nodes: ThumbNode[] = [];
  const nodesById: Record<string, ThumbNode> = {};

  for (const [id, node] of Object.entries(raw.nodes)) {
    if (id === "root" || node.isMastery) continue;
    const pos = rawPos[id];
    if (!pos) continue;
    if (!node.name && (!node.stats || node.stats.length === 0)) continue;

    const kind: ThumbNode["kind"] = node.isKeystone
      ? "keystone"
      : node.isNotable
        ? "notable"
        : "normal";

    const computed: ThumbNode = { id, x: pos.x, y: pos.y, kind };
    nodes.push(computed);
    nodesById[id] = computed;
  }

  cachedGeometry = {
    nodes,
    nodesById,
    connections,
    baseHashes: (raw.nodes.root?.out ?? []).map(String),
    bounds: { minX, minY, maxX, maxY },
  };
  return cachedGeometry;
}

function computeViewBox(geo: CachedAtlasGeometry, activeIds: Set<string>) {
  const aspect = 16 / 9;

  if (activeIds.size > 0) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let count = 0;

    for (const id of activeIds) {
      const node = geo.nodesById[id];
      if (!node) continue;
      count++;
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    }

    if (count > 0) {
      const pad = 900;
      minX -= pad;
      maxX += pad;
      minY -= pad;
      maxY += pad;

      let w = Math.max(4200, maxX - minX);
      let h = Math.max(2362, maxY - minY);

      if (w / h > aspect) {
        h = w / aspect;
      } else {
        w = h * aspect;
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h: Math.round(h) };
    }
  }

  const fullH = geo.bounds.maxY - geo.bounds.minY + 1000;
  const fullW = fullH * aspect;
  const cx = (geo.bounds.minX + geo.bounds.maxX) / 2;
  const cy = (geo.bounds.minY + geo.bounds.maxY) / 2;
  return {
    x: Math.round(cx - fullW / 2),
    y: Math.round(cy - fullH / 2),
    w: Math.round(fullW),
    h: Math.round(fullH),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim() ?? "";

  const geo = getGeometry();
  const decoded = url ? await resolveAtlasTreeUrl(url) : null;
  const allocatedSet = new Set(decoded?.hashes ?? []);
  const activeHashSet = new Set(allocatedSet);
  if (allocatedSet.size > 0) {
    for (const base of geo.baseHashes) activeHashSet.add(base);
  }

  const vb = computeViewBox(geo, allocatedSet);

  const inactivePaths: string[] = [];
  const activePaths: string[] = [];
  for (const conn of geo.connections) {
    if (activeHashSet.has(conn.a) && activeHashSet.has(conn.b)) {
      activePaths.push(conn.pathSegment);
    } else {
      inactivePaths.push(conn.pathSegment);
    }
  }

  const inactiveCircles: string[] = [];
  const activeCircles: string[] = [];

  for (const node of geo.nodes) {
    const r = node.kind === "keystone" ? 72 : node.kind === "notable" ? 54 : 34;
    if (allocatedSet.has(node.id)) {
      const fill = node.kind === "normal" ? "#e8c060" : "#1c1608";
      const sw = node.kind === "normal" ? 28 : 42;
      activeCircles.push(
        `<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="${fill}" stroke="#e8c060" stroke-width="${sw}"/>`,
      );
      if (node.kind !== "normal") {
        activeCircles.push(
          `<circle cx="${node.x}" cy="${node.y}" r="${Math.round(r * 0.42)}" fill="#f5d47a"/>`,
        );
      }
    } else {
      inactiveCircles.push(
        `<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="#181a1e" stroke="#3c4048" stroke-width="18"/>`,
      );
    }
  }

  const cxBg = Math.round(vb.x + vb.w / 2);
  const cyBg = Math.round(vb.y + vb.h / 2);
  const ring1 = Math.round(vb.h * 0.28);
  const ring2 = Math.round(vb.h * 0.46);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}">
  <defs>
    <radialGradient id="atlas-bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#202329"/>
      <stop offset="100%" stop-color="#0f1013"/>
    </radialGradient>
  </defs>
  <rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="url(#atlas-bg)"/>
  <circle cx="${cxBg}" cy="${cyBg}" r="${ring1}" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="16"/>
  <circle cx="${cxBg}" cy="${cyBg}" r="${ring2}" fill="none" stroke="#ffffff" stroke-opacity="0.025" stroke-width="16"/>
  <path d="${inactivePaths.join(" ")}" fill="none" stroke="#2c2f36" stroke-width="20"/>
  <g>${inactiveCircles.join("")}</g>
  ${
    activePaths.length > 0
      ? `<path d="${activePaths.join(" ")}" fill="none" stroke="#e8c060" stroke-opacity="0.2" stroke-width="115" stroke-linecap="round"/>
  <path d="${activePaths.join(" ")}" fill="none" stroke="#e8c060" stroke-width="48" stroke-linecap="round"/>`
      : ""
  }
  <g>${activeCircles.join("")}</g>
</svg>`;

  if (searchParams.get("format") === "png") {
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
    return new ImageResponse(
      createElement("img", {
        src: dataUrl,
        alt: "",
        width: 1280,
        height: 720,
        style: { width: "1280px", height: "720px" },
      }),
      {
        width: 1280,
        height: 720,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      },
    );
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
