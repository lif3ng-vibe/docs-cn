/**
 * System map - geometry and copy for the animated platform diagram.
 *
 * Nodes are positioned per layout; edges are *generated* from those positions
 * rather than hand-written, which is what makes the second (narrow) layout
 * nearly free - same node list, same edge list, different coordinates and a
 * different axis per edge.
 */

export type NodeId =
  | "git"
  | "cli"
  | "desktop"
  | "agent"
  | "build"
  | "versions"
  | "server"
  | "pg"
  | "redis"
  | "mail"
  | "storage"
  | "edge"
  | "visitors";

export type Box = { x: number; y: number; w: number; h: number };

/**
 * "h" left→right, "v" top→bottom, "h-rev"/"v-rev" the same axis travelled
 * backwards (for edges that point upstream, like a visitor's request arriving
 * at the edge), "return" a side loop back, "arc" a U underneath.
 */
export type Axis = "h" | "v" | "h-rev" | "v-rev" | "return" | "arc";

export type NodeDef = {
  label: string;
  sub?: string;
  kind: "pill" | "system" | "rail";
  /** Beat at which this node becomes the active one. */
  beat: number;
};

export const NODES: Record<NodeId, NodeDef> = {
  git: { label: "git push", sub: "任意分支", kind: "pill", beat: 0 },
  cli: { label: "CLI", sub: "openship up", kind: "pill", beat: 0 },
  desktop: { label: "桌面应用", sub: "Mac · Windows", kind: "pill", beat: 0 },
  agent: { label: "AI 智能体", sub: "通过 MCP", kind: "pill", beat: 0 },

  build: { label: "构建", sub: "识别 · 安装 · 编译", kind: "system", beat: 1 },
  versions: { label: "不可变版本", kind: "rail", beat: 1 },

  server: { label: "你的服务器", sub: "云端 · VPS · 家庭实验室", kind: "system", beat: 2 },
  pg: { label: "Postgres", kind: "pill", beat: 3 },
  redis: { label: "Redis", kind: "pill", beat: 3 },
  mail: { label: "邮件", kind: "pill", beat: 3 },
  storage: { label: "对象存储", kind: "pill", beat: 3 },

  edge: { label: "边缘", sub: "域名 · SSL", kind: "system", beat: 4 },
  visitors: { label: "访客", kind: "pill", beat: 4 },
};

/**
 * Beats whose active node is not simply "the node whose beat this is".
 * Rollback re-lights the version rail and the build it restores, both of which
 * first appeared back on beat 1.
 */
export const BEAT_HOT: Record<number, NodeId[]> = {
  5: ["versions", "build"],
};

export type EdgeDef = {
  from: NodeId;
  to: NodeId;
  /** Beat at which this connection draws itself. */
  beat: number;
  label?: string;
};

export const EDGES: EdgeDef[] = [
  { from: "git", to: "build", beat: 0 },
  { from: "cli", to: "build", beat: 0 },
  { from: "desktop", to: "build", beat: 0 },
  { from: "agent", to: "build", beat: 0 },

  { from: "build", to: "versions", beat: 1 },
  { from: "build", to: "server", beat: 2, label: "SSH" },

  { from: "server", to: "pg", beat: 3 },
  { from: "server", to: "redis", beat: 3 },
  { from: "server", to: "mail", beat: 3 },
  { from: "server", to: "storage", beat: 3 },

  { from: "server", to: "edge", beat: 4 },
  /* Requests travel inbound - visitors hit the edge, not the other way round. */
  { from: "visitors", to: "edge", beat: 4, label: "HTTPS" },

  { from: "versions", to: "build", beat: 5, label: "回滚" },
];

export type EdgeKey = `${NodeId}>${NodeId}`;

export const edgeKey = (e: EdgeDef): EdgeKey => `${e.from}>${e.to}`;

export type Layout = {
  viewBox: string;
  pos: Record<NodeId, Box>;
  axis: Record<EdgeKey, Axis>;
};

/* ─── Wide: four layers left→right ──────────────────────────────
 * System nodes are flat-top hexagons, so their height is always
 * √3/2 × width (≈0.866) - keep the two in sync or the edge anchors
 * drift off the shape.
 */
const WIDE: Layout = {
  /* Cropped to the node bounds (plus halo) so the section is not padded out
   * by dead space inside the SVG. */
  viewBox: "18 40 1102 524",
  pos: {
    git: { x: 36, y: 136, w: 140, h: 44 },
    cli: { x: 36, y: 190, w: 140, h: 44 },
    desktop: { x: 36, y: 244, w: 140, h: 44 },
    agent: { x: 36, y: 298, w: 140, h: 44 },

    build: { x: 330, y: 185, w: 150, h: 130 },
    versions: { x: 320, y: 452, w: 190, h: 64 },

    server: { x: 620, y: 131, w: 160, h: 138 },
    pg: { x: 960, y: 76, w: 142, h: 36 },
    redis: { x: 960, y: 130, w: 142, h: 36 },
    mail: { x: 960, y: 184, w: 142, h: 36 },
    storage: { x: 960, y: 238, w: 142, h: 36 },

    edge: { x: 625, y: 410, w: 150, h: 130 },
    visitors: { x: 960, y: 455, w: 142, h: 40 },
  },
  axis: {
    "git>build": "h",
    "cli>build": "h",
    "desktop>build": "h",
    "agent>build": "h",
    "build>versions": "v",
    "build>server": "h",
    "server>pg": "h",
    "server>redis": "h",
    "server>mail": "h",
    "server>storage": "h",
    "server>edge": "v",
    "visitors>edge": "h-rev",
    "versions>build": "return",
  } as Record<EdgeKey, Axis>,
};

/* ─── Narrow: one vertical spine with two side branches ───────── */
const NARROW: Layout = {
  viewBox: "4 2 414 720",
  pos: {
    git: { x: 16, y: 14, w: 180, h: 42 },
    cli: { x: 224, y: 14, w: 180, h: 42 },
    desktop: { x: 16, y: 66, w: 180, h: 42 },
    agent: { x: 224, y: 66, w: 180, h: 42 },

    build: { x: 38, y: 152, w: 134, h: 116 },
    versions: { x: 212, y: 176, w: 190, h: 68 },

    server: { x: 38, y: 336, w: 134, h: 116 },
    /* Nudged down and in so the private-network bracket clears both the
     * rollback arc above it and the right edge of the viewBox. */
    pg: { x: 210, y: 320, w: 178, h: 32 },
    redis: { x: 210, y: 364, w: 178, h: 32 },
    mail: { x: 210, y: 408, w: 178, h: 32 },
    storage: { x: 210, y: 452, w: 178, h: 32 },

    edge: { x: 38, y: 520, w: 134, h: 116 },
    visitors: { x: 25, y: 668, w: 160, h: 38 },
  },
  axis: {
    "git>build": "v",
    "cli>build": "v",
    "desktop>build": "v",
    "agent>build": "v",
    "build>versions": "h",
    "build>server": "v",
    "server>pg": "h",
    "server>redis": "h",
    "server>mail": "h",
    "server>storage": "h",
    "server>edge": "v",
    "visitors>edge": "v-rev",
    "versions>build": "arc",
  } as Record<EdgeKey, Axis>,
};

export const LAYOUTS = { wide: WIDE, narrow: NARROW };
export type LayoutName = keyof typeof LAYOUTS;

/* ─── Geometry helpers ────────────────────────────────────────── */

export const cx = (b: Box) => b.x + b.w / 2;
export const cy = (b: Box) => b.y + b.h / 2;

const n = (v: number) => Math.round(v * 10) / 10;

/**
 * Control-point reach for an S-curve spanning `gap`. Never more than half the
 * gap, or the two control points cross and the curve doubles back on itself -
 * which is what short edges (server→services in the narrow layout) hit.
 */
const ctrl = (gap: number) => Math.max(6, Math.min(90, Math.abs(gap) * 0.5));

/** Left edge of `a` → right edge of `b`, eased horizontally. */
function hCurve(a: Box, b: Box) {
  const x1 = a.x + a.w;
  const y1 = cy(a);
  const x2 = b.x;
  const y2 = cy(b);
  const d = ctrl(x2 - x1);
  return `M${n(x1)} ${n(y1)} C${n(x1 + d)} ${n(y1)} ${n(x2 - d)} ${n(y2)} ${n(x2)} ${n(y2)}`;
}

/** Right edge of `a` → left edge of `b`, i.e. the same curve travelled leftward. */
function hCurveRev(a: Box, b: Box) {
  const x1 = a.x;
  const y1 = cy(a);
  const x2 = b.x + b.w;
  const y2 = cy(b);
  const d = ctrl(x1 - x2);
  return `M${n(x1)} ${n(y1)} C${n(x1 - d)} ${n(y1)} ${n(x2 + d)} ${n(y2)} ${n(x2)} ${n(y2)}`;
}

/** Bottom of `a` → top of `b`, eased vertically. */
function vCurve(a: Box, b: Box) {
  const x1 = cx(a);
  const y1 = a.y + a.h;
  const x2 = cx(b);
  const y2 = b.y;
  const d = ctrl(y2 - y1);
  return `M${n(x1)} ${n(y1)} C${n(x1)} ${n(y1 + d)} ${n(x2)} ${n(y2 - d)} ${n(x2)} ${n(y2)}`;
}

/** Top of `a` → bottom of `b`, i.e. the same curve travelled upward. */
function vCurveRev(a: Box, b: Box) {
  const x1 = cx(a);
  const y1 = a.y;
  const x2 = cx(b);
  const y2 = b.y + b.h;
  const d = ctrl(y1 - y2);
  return `M${n(x1)} ${n(y1)} C${n(x1)} ${n(y1 - d)} ${n(x2)} ${n(y2 + d)} ${n(x2)} ${n(y2)}`;
}

/** Side loop: out of `a`'s left, back into `b`'s underside. Rollback. */
function returnCurve(a: Box, b: Box) {
  const x1 = a.x;
  const y1 = cy(a);
  const x2 = b.x + b.w * 0.22;
  const y2 = b.y + b.h;
  const bow = 62;
  return `M${n(x1)} ${n(y1)} C${n(x1 - bow)} ${n(y1)} ${n(x2 - bow)} ${n(y2 + 26)} ${n(x2)} ${n(y2)}`;
}

/** U-turn passing under both boxes. Rollback, when `a` sits beside `b`. */
function arcCurve(a: Box, b: Box) {
  const x1 = cx(a);
  const y1 = a.y + a.h;
  const x2 = cx(b);
  const y2 = b.y + b.h;
  const my = Math.max(y1, y2) + 22;
  return `M${n(x1)} ${n(y1)} C${n(x1)} ${n(my)} ${n(x2)} ${n(my)} ${n(x2)} ${n(y2)}`;
}

export function edgePath(layout: Layout, edge: EdgeDef): string {
  const a = layout.pos[edge.from];
  const b = layout.pos[edge.to];
  switch (layout.axis[edgeKey(edge)]) {
    case "v":
      return vCurve(a, b);
    case "h-rev":
      return hCurveRev(a, b);
    case "v-rev":
      return vCurveRev(a, b);
    case "return":
      return returnCurve(a, b);
    case "arc":
      return arcCurve(a, b);
    default:
      return hCurve(a, b);
  }
}

/** Flat-top regular hexagon inscribed in `b` (expects h ≈ 0.866 × w). */
export function hexPath(b: Box): string {
  const r = b.w / 2;
  const x0 = cx(b);
  const y0 = cy(b);
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i);
    return `${n(x0 + r * Math.cos(a))} ${n(y0 + r * Math.sin(a))}`;
  });
  return `M${pts.join(" L")} Z`;
}

export const VERSION_COUNT = 4;

/** The v1…v4 chips laid out inside the versions rail. */
export function versionChips(b: Box) {
  const w = 34;
  const h = 22;
  const gap = 8;
  const total = VERSION_COUNT * w + (VERSION_COUNT - 1) * gap;
  const x0 = b.x + (b.w - total) / 2;
  const y = b.y + 13;
  return Array.from({ length: VERSION_COUNT }, (_, i) => ({
    x: x0 + i * (w + gap),
    y,
    w,
    h,
    label: `v${i + 1}`,
  }));
}

const SERVICE_IDS: NodeId[] = ["pg", "redis", "mail", "storage"];

/** Dashed bracket drawn around the managed services - the private network. */
export function netBox(pos: Record<NodeId, Box>): Box {
  const boxes = SERVICE_IDS.map((id) => pos[id]);
  const x = Math.min(...boxes.map((b) => b.x)) - 14;
  const y = Math.min(...boxes.map((b) => b.y)) - 24;
  const x2 = Math.max(...boxes.map((b) => b.x + b.w)) + 14;
  const y2 = Math.max(...boxes.map((b) => b.y + b.h)) + 14;
  return { x, y, w: x2 - x, h: y2 - y };
}

/* ─── Beats: the deploy run, one chapter at a time ───────────── */

export type Beat = { id: string; chip: string; caption: string };

export const BEATS: Beat[] = [
  {
    id: "push",
    chip: "推送",
    caption:
      "git push、CLI 命令、桌面应用，或通过 MCP 接入的 AI 智能体，都能触发部署。无论什么技术栈——Node、Python、Go、Rust、Docker、monorepo——统统自动识别。",
  },
  {
    id: "build",
    chip: "构建",
    caption:
      "镜像在你的机器上构建，而不是生产服务器。每次构建都产出不可变、带版本的制品。",
  },
  {
    id: "ship",
    chip: "交付",
    caption:
      "通过纯 SSH 流式传输到目标机器，以全新容器启动。不装 agent，不起守护进程，你的机器上什么都不用装。",
  },
  {
    id: "wire",
    chip: "接线",
    caption:
      "Postgres、Redis、邮件与对象存储在隔离的私有网络中与应用会合——你的应用可达，公网永远摸不到。",
  },
  {
    id: "route",
    chip: "路由",
    caption:
      "你的域名解析到边缘层，由它终结免费自动续期的 SSL，并把每个请求交给新容器——切换全程零停机。",
  },
  {
    id: "rollback",
    chip: "回滚",
    caption:
      "之前运行的版本始终保温。一次点击即可切回——无需重建，无需等待，不丢状态。",
  },
];

/** Plain-language walkthrough for screen readers, since the SVG is decorative. */
export const SR_DESCRIPTION =
  "Openship 部署路径示意图。git push、CLI 命令、桌面应用或 AI 智能体触发构建。" +
  "构建在你的机器上运行并产出不可变版本，随后通过 SSH 流式传输到你的服务器——" +
  "可以是 Openship Cloud、你自己的 VPS 或家庭实验室。在服务器上，托管的 Postgres、Redis、邮件与对象存储" +
  "通过私有网络与应用会合。边缘层终结你的域名并自动签发 SSL，向访客提供服务；任意历史版本均可一键恢复。";
