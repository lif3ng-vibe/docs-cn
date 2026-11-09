#!/usr/bin/env node
/**
 * 静态导出后处理（GitHub Pages 镜像专用）：
 *  1. 折叠 root param 目录：output:'export' 会把 root param 值（cn）物化成
 *     out/cn/ 一层，而站内 URL 不含该段——把 out/cn/* 上移合并到 out/。
 *  2. 生成静态 llms.txt：上游是 /llms.txt route（服务端渲染），镜像无服务端，
 *     改为构建后从产物 html 提取标题/URL 直接生成。
 */
import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const cnDir = join(outDir, "cn");

const log = (msg) => console.log(`[postprocess] ${msg}`);

// 1. 折叠 out/cn -> out/
if (existsSync(cnDir)) {
  cpSync(cnDir, outDir, { recursive: true, force: true });
  rmSync(cnDir, { recursive: true, force: true });
  log("flattened out/cn -> out");
} else {
  log("no out/cn (already flattened)");
}

// 2. llms.txt：从产物 index.html 提取 <title> 与 canonical。
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
};

const pages = walk(outDir)
  .map((p) => {
    const html = readFileSync(p, "utf8");
    const title =
      html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/\s*\|[^|]*$/, "") ??
      "";
    const canonical =
      html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1] ?? "";
    const href = p
      .slice(outDir.length, -"index.html".length)
      .replaceAll("\\", "/");
    return { title, canonical, href };
  })
  // 404 兜底页（/404、/_not-found）不是文档页，排除。
  .filter((p) => !p.href.startsWith("/404") && !p.href.startsWith("/_not-found"))
  .sort((a, b) => a.href.localeCompare(b.href));

const llmsBody = [
  "# agent-browser 中文文档",
  "",
  "> agent-browser 中文文档（非官方翻译）：面向 AI 智能体的浏览器自动化 CLI。",
  "",
  "上游官方文档: [https://agent-browser.dev](https://agent-browser.dev)",
  "",
  "## Pages",
  "",
  ...pages.map((p) => `- [${p.title || p.href}](${p.canonical || p.href})`),
  "",
].join("\n");

writeFileSync(join(outDir, "llms.txt"), llmsBody);
log(`llms.txt generated (${pages.length} pages)`);
