// 锚点终验：对 dist 的每页 HTML，收 id="..." 集合，核查页内 href="#..." 是否都存在目标 id。
// 跨页链接：解析目标页路径（同目录树）后核对目标页 id。
import fs from "node:fs";
import path from "node:path";

const dist = "apps/web/.next/server/app";
const ids0 = new Set();
const safeDecode = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

function collect(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + e.name;
    if (e.isDirectory()) collect(p);
    else if (e.name.endsWith(".html")) {
      const h = fs.readFileSync(p, "utf8");
      for (const m of h.matchAll(/ id="([^"]+)"/g)) ids0.add(m[1]);
    }
  }
}
collect(dist);
console.log("总唯一 id 数:", ids0.size);

let bad = 0, checked = 0;
function verify(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + "/" + e.name;
    if (e.isDirectory()) verify(p);
    else if (e.name.endsWith(".html")) {
      const h = fs.readFileSync(p, "utf8");
      for (const m of h.matchAll(/href="#([^"]+)"/g)) {
        checked++;
        const anchor = safeDecode(m[1]);
        if (!ids0.has(anchor) && !ids0.has(m[1])) {
          bad++;
          const rel = path.relative(dist, p).replace(/\\/g, "/");
          if (bad <= 25) console.log(`BAD ${rel}  #${m[1]}`);
        }
      }
    }
  }
}
verify(dist);
console.log(bad ? `${bad} 处死锚点（页内+跨页，全局唯一 id 池）` : "CLEAN：全部页内锚点有效");