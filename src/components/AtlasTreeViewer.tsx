"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

type AtlasSpriteCoord = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type AtlasSpriteSheet = {
  filename: string;
  w: number;
  h: number;
  coords: Record<string, AtlasSpriteCoord>;
};

type AtlasRawNode = {
  skill?: number;
  name?: string;
  icon?: string;
  isNotable?: boolean;
  isKeystone?: boolean;
  isMastery?: boolean;
  isWormhole?: boolean;
  isAscendancyStart?: boolean;
  classStartIndex?: number | number[];
  ascendancyName?: string;
  stats?: string[];
  reminderText?: string[];
  flavourText?: string[];
  masteryEffects?: { effect: number; stats: string[] }[];
  group: number;
  orbit: number;
  orbitIndex: number;
  out?: string[];
  in?: string[];
};

type AtlasRawGroup = {
  x: number;
  y: number;
  orbits: number[];
  nodes: string[];
};

type AtlasTreeJson = {
  tree: string;
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  constants: {
    skillsPerOrbit: number[];
    orbitRadii: number[];
  };
  points: {
    totalPoints: number;
    ascendancyPoints: number;
  };
  groups: Record<string, AtlasRawGroup>;
  nodes: Record<string, AtlasRawNode>;
  sprites: {
    normalActive?: { "0.5"?: AtlasSpriteSheet };
    notableActive?: { "0.5"?: AtlasSpriteSheet };
    keystoneActive?: { "0.5"?: AtlasSpriteSheet };
    mastery?: { "0.5"?: AtlasSpriteSheet };
  };
};

type ComputedNode = AtlasRawNode & {
  id: string;
  x: number;
  y: number;
  kind: "normal" | "notable" | "keystone" | "mastery";
  radius: number;
  ringRadius: number;
  sprite?: {
    filename: string;
    sheetW: number;
    sheetH: number;
    coord: AtlasSpriteCoord;
  };
  searchText: string;
};

type ComputedConnection = {
  id: string;
  a: string;
  b: string;
  pathSegment: string;
};

type ComputedTree = {
  nodes: ComputedNode[];
  nodesById: Record<string, ComputedNode>;
  connections: ComputedConnection[];
  baseHashes: string[];
  bounds: { x: number; y: number; width: number; height: number };
  totalPoints: number;
};

type SummaryPart = { text: string; augmented: boolean };

type SummaryEntry = {
  id: string;
  parts: SummaryPart[];
  skills: string[];
  isKeystone: boolean;
};

const NODE_RADIUS = {
  normal: 34,
  notable: 49,
  keystone: 69,
  mastery: 113,
} as const;

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 15;

let cachedTreePromise: Promise<ComputedTree> | null = null;

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

function connectId(a: string, b: string): string {
  const na = Number.parseInt(a, 10);
  const nb = Number.parseInt(b, 10);
  return na > nb ? `c${nb}-${na}` : `c${na}-${nb}`;
}

function processAtlasData(raw: AtlasTreeJson): ComputedTree {
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

  const outMap: Record<string, string[]> = {};
  for (const [id, node] of Object.entries(raw.nodes)) {
    if (id === "root") continue;
    outMap[id] = [...(node.out ?? [])];
  }

  const seenConnections = new Set<string>();
  const connections: ComputedConnection[] = [];

  for (const [id, node] of Object.entries(raw.nodes)) {
    if (id === "root" || node.isWormhole || node.isMastery) continue;
    const posU = rawPos[id];
    if (!posU) continue;

    for (const targetId of outMap[id] ?? []) {
      const target = raw.nodes[targetId];
      const posG = rawPos[targetId];
      if (!target || !posG || target.isMastery) continue;
      if (target.ascendancyName !== node.ascendancyName) continue;

      const cid = connectId(id, targetId);
      if (seenConnections.has(cid)) continue;
      seenConnections.add(cid);

      if (node.group === target.group && node.orbit === target.orbit) {
        const r = orbitRadii[node.orbit] ?? 0;
        const count = skillsPerOrbit[node.orbit] ?? 1;
        const diff = (node.orbitIndex - target.orbitIndex + count) % count;
        const sweep = diff > count / 2 ? 1 : 0;
        connections.push({
          id: cid,
          a: id,
          b: targetId,
          pathSegment: `M ${posU.x} ${posU.y} A ${r} ${r} 0 0 ${sweep} ${posG.x} ${posG.y}`,
        });
      } else {
        connections.push({
          id: cid,
          a: id,
          b: targetId,
          pathSegment: `M ${posU.x} ${posU.y} L ${posG.x} ${posG.y}`,
        });
      }
    }
  }

  const nodes: ComputedNode[] = [];
  const nodesById: Record<string, ComputedNode> = {};

  for (const [id, node] of Object.entries(raw.nodes)) {
    if (id === "root") continue;
    const pos = rawPos[id];
    if (!pos) continue;
    if (node.isMastery && !node.masteryEffects) continue;
    if (!node.name && (!node.stats || node.stats.length === 0)) continue;

    const kind: ComputedNode["kind"] = node.isMastery
      ? "mastery"
      : node.isKeystone
        ? "keystone"
        : node.isNotable
          ? "notable"
          : "normal";

    const radius = NODE_RADIUS[kind];
    const ringRadius = kind === "mastery" ? 1.2 * NODE_RADIUS.notable : 1.2 * radius;

    let sprite: ComputedNode["sprite"];
    if (node.icon && raw.sprites) {
      const sheet = node.isNotable
        ? raw.sprites.notableActive?.["0.5"]
        : node.isKeystone
          ? raw.sprites.keystoneActive?.["0.5"]
          : node.isMastery
            ? raw.sprites.mastery?.["0.5"]
            : raw.sprites.normalActive?.["0.5"];
      const coord = sheet?.coords?.[node.icon];
      if (sheet && coord) {
        sprite = {
          filename: sheet.filename,
          sheetW: sheet.w,
          sheetH: sheet.h,
          coord,
        };
      }
    }

    const searchParts = [
      node.name ?? "",
      ...(node.stats ?? []),
      ...(node.reminderText ?? []),
      ...(node.masteryEffects?.flatMap((m) => m.stats) ?? []),
    ];

    const computed: ComputedNode = {
      ...node,
      id,
      x: pos.x,
      y: pos.y,
      kind,
      radius,
      ringRadius,
      sprite,
      searchText: searchParts.join(" ").toLowerCase(),
    };

    nodes.push(computed);
    nodesById[id] = computed;
  }

  const baseHashes = (raw.nodes.root?.out ?? []).map(String);
  const pad = 100;

  return {
    nodes,
    nodesById,
    connections,
    baseHashes,
    bounds: {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    },
    totalPoints: raw.points?.totalPoints ?? 132,
  };
}

function loadAtlasTree(): Promise<ComputedTree> {
  if (!cachedTreePromise) {
    cachedTreePromise = fetch("/atlas/atlas-tree-3.30.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AtlasTreeJson>;
      })
      .then(processAtlasData)
      .catch((err) => {
        cachedTreePromise = null;
        throw err;
      });
  }
  return cachedTreePromise;
}

function buildStatsSummary(
  allocatedHashes: string[],
  nodesById: Record<string, ComputedNode>,
): SummaryEntry[] {
  const numRegex = /-?\d+\.?\d*/g;
  const entries: SummaryEntry[] = [];
  const grouped = new Map<string, { template: string; values: number[]; skills: string[] }>();

  for (const hash of allocatedHashes) {
    const node = nodesById[hash];
    if (!node || !node.stats?.length) continue;

    if (node.isKeystone) {
      entries.push({
        id: `ks-${hash}`,
        parts: [{ text: `${node.name}: ${node.stats.join(" · ")}`, augmented: false }],
        skills: [hash],
        isKeystone: true,
      });
      continue;
    }

    for (const stat of node.stats) {
      const matches = stat.match(numRegex) ?? [];
      const template = stat.replace(numRegex, "#");
      const nums = matches.map((v) => Number.parseFloat(v));
      const existing = grouped.get(template);
      if (existing) {
        for (let i = 0; i < nums.length; i++) {
          existing.values[i] = (existing.values[i] ?? 0) + nums[i];
        }
        if (!existing.skills.includes(hash)) existing.skills.push(hash);
      } else {
        grouped.set(template, { template, values: nums, skills: [hash] });
      }
    }
  }

  let idx = 0;
  for (const item of grouped.values()) {
    const segments = item.template.split("#");
    const parts: SummaryPart[] = [];
    segments.forEach((seg, segIdx) => {
      if (seg) parts.push({ text: seg, augmented: false });
      if (segIdx < item.values.length) {
        const rounded = Number(item.values[segIdx].toFixed(2));
        parts.push({ text: String(rounded), augmented: true });
      }
    });
    entries.push({
      id: `sum-${idx++}`,
      parts,
      skills: item.skills,
      isKeystone: false,
    });
  }

  return entries;
}

const AtlasSvgBoard = memo(function AtlasSvgBoard({
  tree,
  allocatedSet,
  inactivePathD,
  activePathD,
  searchMatchSet,
}: {
  tree: ComputedTree;
  allocatedSet: Set<string>;
  inactivePathD: string;
  activePathD: string;
  searchMatchSet: Set<string>;
}) {
  return (
    <>
      <path d={inactivePathD} fill="none" stroke="#2f3237" strokeWidth={16} />
      <path d={activePathD} fill="none" stroke="#e8c060" strokeWidth={42} strokeLinecap="round" />

      {/* Inactive nodes rendered first so active/filtered nodes always sit crisply on top */}
      <g>
        {tree.nodes.map((node) => {
          const isAllocated = allocatedSet.has(node.id);
          const isFiltered = searchMatchSet.has(node.id);
          if (isAllocated || isFiltered) return null;
          const baseStrokeWidth =
            node.kind === "keystone" ? 40 : node.kind === "notable" ? 27 : 17;

          return (
            <g
              key={node.id}
              id={`atlas-node-${node.id}`}
              data-node-id={node.id}
              className="atlas-node-inactive"
            >
              {node.sprite ? (
                <svg
                  x={node.x - node.radius}
                  y={node.y - node.radius}
                  width={node.sprite.coord.w + node.radius}
                  height={node.sprite.coord.h + node.radius}
                  viewBox={`${node.sprite.coord.x} ${node.sprite.coord.y} ${node.sprite.coord.w} ${node.sprite.coord.h}`}
                  pointerEvents="none"
                >
                  <image
                    href={node.sprite.filename}
                    width={node.sprite.sheetW}
                    height={node.sprite.sheetH}
                  />
                </svg>
              ) : null}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.ringRadius}
                fill="transparent"
                stroke="#45484f"
                strokeWidth={baseStrokeWidth}
                className="atlas-ring"
              />
            </g>
          );
        })}
      </g>

      {/* Active & search-matched nodes */}
      <g>
        {tree.nodes.map((node) => {
          const isAllocated = allocatedSet.has(node.id);
          const isFiltered = searchMatchSet.has(node.id);
          if (!isAllocated && !isFiltered) return null;

          const stroke = isFiltered ? "#ef4444" : "#e8c060";
          const strokeWidth = isFiltered ? 46 : 42;

          return (
            <g
              key={node.id}
              id={`atlas-node-${node.id}`}
              data-node-id={node.id}
              className={isFiltered ? "atlas-node-filtered" : "atlas-node-active"}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.ringRadius}
                fill="#141414"
                fillOpacity={0.85}
                pointerEvents="none"
              />
              {node.sprite ? (
                <svg
                  x={node.x - node.radius}
                  y={node.y - node.radius}
                  width={node.sprite.coord.w + node.radius}
                  height={node.sprite.coord.h + node.radius}
                  viewBox={`${node.sprite.coord.x} ${node.sprite.coord.y} ${node.sprite.coord.w} ${node.sprite.coord.h}`}
                  pointerEvents="none"
                >
                  <image
                    href={node.sprite.filename}
                    width={node.sprite.sheetW}
                    height={node.sprite.sheetH}
                  />
                </svg>
              ) : null}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.ringRadius}
                fill="transparent"
                stroke={stroke}
                strokeWidth={strokeWidth}
                className="atlas-ring"
              />
            </g>
          );
        })}
      </g>
    </>
  );
});

export default function AtlasTreeViewer({
  allocatedHashes,
  masteryEffects = {},
  atlasUrl,
  title,
}: {
  allocatedHashes: string[];
  masteryEffects?: Record<string, number>;
  atlasUrl?: string;
  title?: string;
}) {
  const [tree, setTree] = useState<ComputedTree | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [dragging, setDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<ComputedNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const cameraRef = useRef({ cx: 0, cy: 0, zoom: 1, rafId: 0 });
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPinchDistRef = useRef<number | null>(null);
  const movedRef = useRef(false);
  const lastCursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredIdRef = useRef<string | null>(null);
  const summaryHighlightedRef = useRef<string[]>([]);

  const syncCameraToDom = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !tree) return;
    const cam = cameraRef.current;
    const dx = tree.bounds.width / cam.zoom;
    const dy = tree.bounds.height / cam.zoom;
    const x = cam.cx - dx / 2;
    const y = cam.cy - dy / 2;
    svg.setAttribute("viewBox", `${x} ${y} ${dx} ${dy}`);
  }, [tree]);

  const scheduleCameraSync = useCallback(() => {
    const cam = cameraRef.current;
    if (cam.rafId) return;
    cam.rafId = requestAnimationFrame(() => {
      cam.rafId = 0;
      syncCameraToDom();
    });
  }, [syncCameraToDom]);

  useEffect(() => {
    let active = true;
    loadAtlasTree()
      .then((computed) => {
        if (!active) return;
        cameraRef.current = {
          cx: computed.bounds.x + computed.bounds.width / 2,
          cy: computed.bounds.y + computed.bounds.height / 2,
          zoom: 1,
          rafId: 0,
        };
        setTree(computed);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
      if (cameraRef.current.rafId) {
        cancelAnimationFrame(cameraRef.current.rafId);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (tree) syncCameraToDom();
  }, [tree, fullscreen, syncCameraToDom]);

  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  const allocatedSet = useMemo(() => new Set(allocatedHashes), [allocatedHashes]);

  const activeHashSet = useMemo(() => {
    const set = new Set(allocatedHashes);
    if (tree) {
      for (const base of tree.baseHashes) set.add(base);
    }
    return set;
  }, [allocatedHashes, tree]);

  const { inactivePathD, activePathD } = useMemo(() => {
    if (!tree) return { inactivePathD: "", activePathD: "" };
    const inactive: string[] = [];
    const active: string[] = [];
    for (const conn of tree.connections) {
      if (activeHashSet.has(conn.a) && activeHashSet.has(conn.b)) {
        active.push(conn.pathSegment);
      } else {
        inactive.push(conn.pathSegment);
      }
    }
    return {
      inactivePathD: inactive.join(" "),
      activePathD: active.join(" "),
    };
  }, [tree, activeHashSet]);

  const searchMatchSet = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term || !tree) return new Set<string>();
    const matches = new Set<string>();
    for (const node of tree.nodes) {
      if (node.searchText.includes(term)) matches.add(node.id);
    }
    return matches;
  }, [searchQuery, tree]);

  const statsSummary = useMemo(() => {
    if (!tree) return [];
    return buildStatsSummary(allocatedHashes, tree.nodesById);
  }, [allocatedHashes, tree]);

  const pointsSpent = useMemo(() => {
    if (!tree) return allocatedHashes.length;
    return allocatedHashes.filter((h) => Boolean(tree.nodesById[h])).length;
  }, [allocatedHashes, tree]);

  const resetView = useCallback(() => {
    if (!tree) return;
    cameraRef.current.cx = tree.bounds.x + tree.bounds.width / 2;
    cameraRef.current.cy = tree.bounds.y + tree.bounds.height / 2;
    cameraRef.current.zoom = 1;
    syncCameraToDom();
  }, [tree, syncCameraToDom]);

  const applyZoom = useCallback(
    (nextZoomRaw: number, clientPoint?: { x: number; y: number }) => {
      if (!tree) return;
      const cam = cameraRef.current;
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoomRaw));
      if (Math.abs(nextZoom - cam.zoom) < 0.001) return;

      const svg = svgRef.current;
      if (clientPoint && svg) {
        const rect = svg.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const curDx = tree.bounds.width / cam.zoom;
          const curDy = tree.bounds.height / cam.zoom;
          const scale = Math.max(curDx / rect.width, curDy / rect.height);
          const renderedW = curDx / scale;
          const renderedH = curDy / scale;
          const offsetX = (rect.width - renderedW) / 2;
          const offsetY = (rect.height - renderedH) / 2;

          const worldX = cam.cx - curDx / 2 + (clientPoint.x - rect.left - offsetX) * scale;
          const worldY = cam.cy - curDy / 2 + (clientPoint.y - rect.top - offsetY) * scale;

          const ratio = cam.zoom / nextZoom;
          cam.cx = worldX + (cam.cx - worldX) * ratio;
          cam.cy = worldY + (cam.cy - worldY) * ratio;
        }
      }

      cam.zoom = nextZoom;
      scheduleCameraSync();
    },
    [tree, scheduleCameraSync],
  );

  // Non-passive wheel listener so zooming the tree doesn't scroll the page
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !tree) return;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.altKey) return;
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
      applyZoom(cameraRef.current.zoom * factor, { x: event.clientX, y: event.clientY });
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [tree, applyZoom]);

  const positionTooltipDom = useCallback((clientX: number, clientY: number) => {
    lastCursorRef.current = { x: clientX, y: clientY };
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!tooltip || !container) return;

    const rect = container.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const left = Math.min(Math.max(12, relX + 16), Math.max(12, rect.width - 340));
    const top = Math.min(Math.max(12, relY + 16), Math.max(12, rect.height - 220));
    tooltip.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }, []);

  useLayoutEffect(() => {
    if (hoveredNode) {
      positionTooltipDom(lastCursorRef.current.x, lastCursorRef.current.y);
    }
  }, [hoveredNode, positionTooltipDom]);

  const setHoveredById = useCallback(
    (nodeId: string | null, clientX?: number, clientY?: number) => {
      if (clientX !== undefined && clientY !== undefined) {
        positionTooltipDom(clientX, clientY);
      }
      if (hoveredIdRef.current === nodeId) return;
      hoveredIdRef.current = nodeId;
      setHoveredNode(nodeId && tree ? (tree.nodesById[nodeId] ?? null) : null);
    },
    [tree, positionTooltipDom],
  );

  const highlightSummaryNodes = useCallback((ids: string[]) => {
    for (const prevId of summaryHighlightedRef.current) {
      document.getElementById(`atlas-node-${prevId}`)?.classList.remove("atlas-node-summary-highlight");
    }
    for (const nextId of ids) {
      document.getElementById(`atlas-node-${nextId}`)?.classList.add("atlas-node-summary-highlight");
    }
    summaryHighlightedRef.current = ids;
  }, []);

  if (loadError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-[#1b1c1f] p-6 text-center text-white/80">
        <p className="text-sm font-medium">Não foi possível carregar o board interativo do Atlas.</p>
        {atlasUrl ? (
          <a
            href={atlasUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            Abrir no planner externo
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-[#141414] text-white"
          : "relative flex h-[72vh] min-h-[500px] max-h-[820px] w-full flex-col overflow-hidden rounded-2xl bg-[#141414] text-white select-none"
      }
    >
      <style>{`
        .atlas-node-inactive {
          opacity: 0.2;
        }
        .atlas-node-inactive:hover {
          opacity: 0.92;
        }
        .atlas-node-inactive:hover .atlas-ring {
          stroke: #60a5fa;
          stroke-width: 44;
        }
        .atlas-node-active:hover .atlas-ring {
          stroke: #f5d47a;
          stroke-width: 48;
        }
        .atlas-node-filtered {
          opacity: 1;
        }
        .atlas-node-summary-highlight {
          opacity: 1 !important;
        }
        .atlas-node-summary-highlight .atlas-ring {
          stroke: #3b82f6 !important;
          stroke-width: 48 !important;
        }
      `}</style>

      {/* Top toolbar */}
      <div
        className={`z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#141414] px-3 py-2.5 ${
          fullscreen ? "" : "rounded-t-2xl"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#222] px-2.5 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#e8c060]" aria-hidden="true" />
            <span className="tabular-nums text-[#e8c060]">{pointsSpent}</span>
            <span className="text-white/50">/ {tree?.totalPoints ?? 132} pts</span>
          </span>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar node…"
              aria-label="Buscar node no Atlas"
              className="h-8 w-40 rounded-lg border border-white/15 bg-[#1e1e1e] pl-8 pr-7 text-xs text-white placeholder:text-white/40 focus:border-[#e8c060] focus:outline-none sm:w-52"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/45 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {searchQuery.trim() ? (
            <span className="text-[11px] font-medium text-red-400 tabular-nums">
              {searchMatchSet.size} {searchMatchSet.size === 1 ? "node" : "nodes"}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSummaryOpen((prev) => {
                if (prev) highlightSummaryNodes([]);
                return !prev;
              });
            }}
            className={`inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
              summaryOpen
                ? "border-[#e8c060]/60 bg-[#e8c060]/15 text-[#e8c060]"
                : "border-white/15 bg-[#1e1e1e] text-white/85 hover:bg-white/10"
            }`}
          >
            Resumo ({statsSummary.length})
            {summaryOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={resetView}
            aria-label="Centralizar Atlas"
            title="Centralizar Atlas"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#1e1e1e] text-white/80 hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setFullscreen((prev) => !prev)}
            aria-label={fullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"}
            title={fullscreen ? "Sair da tela cheia (Esc)" : "Tela cheia"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#1e1e1e] text-white/80 hover:bg-white/10"
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative flex-1 overflow-hidden bg-[#1b1c1f]">
        {!tree ? (
          <div className="flex h-full items-center justify-center text-xs text-white/60">
            Carregando board do Atlas 3.30…
          </div>
        ) : (
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={title ? `Atlas Tree — ${title}` : "Atlas Skill Tree"}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest("[data-atlas-ui]")) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
              movedRef.current = false;
              if (pointersRef.current.size === 1) {
                setDragging(true);
              }
            }}
            onPointerMove={(event) => {
              const pointers = pointersRef.current;
              const prev = pointers.get(event.pointerId);

              if (prev) {
                if (pointers.size === 1) {
                  const dxScreen = prev.x - event.clientX;
                  const dyScreen = prev.y - event.clientY;
                  if (Math.abs(dxScreen) > 2 || Math.abs(dyScreen) > 2) {
                    movedRef.current = true;
                    setHoveredById(null);
                  }
                  const rect = event.currentTarget.getBoundingClientRect();
                  if (rect.width > 0 && rect.height > 0) {
                    const cam = cameraRef.current;
                    const scale = Math.max(
                      tree.bounds.width / cam.zoom / rect.width,
                      tree.bounds.height / cam.zoom / rect.height,
                    );
                    cam.cx += dxScreen * scale;
                    cam.cy += dyScreen * scale;
                    scheduleCameraSync();
                  }
                } else if (pointers.size === 2) {
                  const otherEntry = Array.from(pointers.entries()).find(
                    ([pid]) => pid !== event.pointerId,
                  );
                  if (otherEntry) {
                    const [, other] = otherEntry;
                    const dist = Math.hypot(other.x - event.clientX, other.y - event.clientY);
                    if (lastPinchDistRef.current !== null) {
                      const ratio = dist / Math.max(1, lastPinchDistRef.current);
                      applyZoom(cameraRef.current.zoom * ratio);
                    }
                    lastPinchDistRef.current = dist;
                  }
                }
                pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                return;
              }

              if (event.pointerType === "mouse") {
                const nodeEl = (event.target as Element | null)?.closest("[data-node-id]");
                const nodeId = nodeEl?.getAttribute("data-node-id") ?? null;
                setHoveredById(nodeId, event.clientX, event.clientY);
              }
            }}
            onPointerLeave={() => {
              setHoveredById(null);
            }}
            onPointerUp={(event) => {
              pointersRef.current.delete(event.pointerId);
              lastPinchDistRef.current = null;
              if (pointersRef.current.size === 0) setDragging(false);

              if (!movedRef.current && event.pointerType !== "mouse") {
                const nodeEl = (event.target as Element | null)?.closest("[data-node-id]");
                const nodeId = nodeEl?.getAttribute("data-node-id") ?? null;
                setHoveredById(nodeId, event.clientX, event.clientY);
              }
            }}
            onPointerCancel={(event) => {
              pointersRef.current.delete(event.pointerId);
              lastPinchDistRef.current = null;
              if (pointersRef.current.size === 0) setDragging(false);
            }}
            onDoubleClick={(event) => {
              if (cameraRef.current.zoom > 1.5) resetView();
              else applyZoom(3.5, { x: event.clientX, y: event.clientY });
            }}
            style={{ touchAction: "none" }}
            className={`h-full w-full ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <AtlasSvgBoard
              tree={tree}
              allocatedSet={allocatedSet}
              inactivePathD={inactivePathD}
              activePathD={activePathD}
              searchMatchSet={searchMatchSet}
            />
          </svg>
        )}

        {/* PoEDB-style stats summary panel */}
        {summaryOpen && tree ? (
          <aside
            data-atlas-ui
            className="absolute bottom-3 right-3 top-3 z-20 flex w-[min(336px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-xl border border-white/15 bg-[#111]/95 text-white shadow-2xl backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="text-xs font-semibold text-white/90">
                Status ativos ({pointsSpent} / {tree.totalPoints})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSummaryOpen(false);
                  highlightSummaryNodes([]);
                }}
                aria-label="Fechar resumo"
                className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 divide-y divide-white/10 overflow-y-auto text-[13px] leading-snug">
              {statsSummary.length === 0 ? (
                <p className="p-4 text-xs text-white/55">Nenhum modificador alocado encontrado.</p>
              ) : (
                statsSummary.map((entry, idx) => (
                  <div
                    key={entry.id}
                    onMouseEnter={() => highlightSummaryNodes(entry.skills)}
                    onMouseLeave={() => highlightSummaryNodes([])}
                    className={`cursor-default px-3 py-2 transition-colors hover:bg-white/10 ${
                      idx % 2 === 1 ? "bg-[#1c1c1c]" : ""
                    }`}
                  >
                    {entry.isKeystone ? (
                      <span className="font-semibold text-[#e8c060]">
                        {entry.parts.map((p) => p.text).join("")}
                      </span>
                    ) : (
                      <span>
                        {entry.parts.map((part, pIdx) =>
                          part.augmented ? (
                            <span key={pIdx} className="font-semibold text-[#8888ff]">
                              {part.text}
                            </span>
                          ) : (
                            <span key={pIdx}>{part.text}</span>
                          ),
                        )}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        ) : null}

        {/* PoEDB-style node hover popover (positioned imperatively via tooltipRef) */}
        {hoveredNode ? (
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{ left: 0, top: 0 }}
            className="pointer-events-none absolute z-30 w-[min(320px,calc(100%-24px))] rounded-xl border border-white/20 bg-[#111]/95 p-3 text-left shadow-2xl backdrop-blur will-change-transform"
          >
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-1.5">
              <p className="text-sm font-bold leading-tight text-white">
                {hoveredNode.name || "Node"}
              </p>
              {allocatedSet.has(hoveredNode.id) ? (
                <span className="shrink-0 rounded bg-[#e8c060]/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#e8c060]">
                  Ativo
                </span>
              ) : null}
            </div>

            {hoveredNode.masteryEffects?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#8888ff]">
                {hoveredNode.masteryEffects.map((eff) => {
                  const isPicked = masteryEffects[hoveredNode.id] === eff.effect;
                  return (
                    <li
                      key={eff.effect}
                      className={isPicked ? "font-semibold text-[#e8c060]" : undefined}
                    >
                      {eff.stats.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {hoveredNode.stats?.length ? (
              <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#8888ff]">
                {hoveredNode.stats.map((stat, i) => (
                  <p key={i}>{stat}</p>
                ))}
              </div>
            ) : null}

            {hoveredNode.reminderText?.length ? (
              <div className="mt-2 space-y-1 text-[11px] italic leading-relaxed text-[#7f7f7f]">
                {hoveredNode.reminderText.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Bottom hint bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#141414] px-3 py-1.5 text-[11px] text-white/55 ${
          fullscreen ? "" : "rounded-b-2xl"
        }`}
      >
        <span>Passe o mouse nos nodes para ver o que fazem · Scroll para zoom · Arraste para mover</span>
        {atlasUrl ? (
          <a
            href={atlasUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-white/80 hover:text-[#e8c060]"
          >
            Abrir planner
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
