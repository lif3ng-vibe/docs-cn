// dist 字面 ** 上下文提取：每处命中打印前后 60 字符，供人工分类
import fs from "node:fs";
import path from "node:path";

const dist = "apps/web/.next/server/app";
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + e.name;
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) files.push(p);
  }
}
walk(dist);

for (const f of files) {
  let h = fs.readFileSync(f, "utf8");
  h = h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<code[\s\S]*?<\/code>/g, " ")
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<[^>]+>/g, "");
  let idx = 0;
  while ((idx = h.indexOf("**", idx)) !== -1) {
    const ctx = h
      .slice(Math.max(0, idx - 70), idx + 70)
      .replace(/+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    console.log(path.relative(dist, f).replace(/\\/g, "/"));
    console.log("   …" + ctx + "…");
    idx += 2;
  }
}
console.log("scan-complete");