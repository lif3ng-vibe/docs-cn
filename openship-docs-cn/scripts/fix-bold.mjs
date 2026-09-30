// CJK 粗体闭合修复（CommonMark right-flanking）：
//  A. 括注型：**词（gloss）**汉 → **词**（gloss）汉   （）** 后跟文字则闭不上）
//  B. 句读型：**……。**汉 → **……**。汉             （句读移出粗体）
// 只在「闭合 ** 后紧跟文字（非空白/非标点）」时改写；后跟标点或行尾本就能闭合，不动。
import fs from "node:fs";

const roots = ["apps/web/content/docs", "apps/web/content/resources"];
const FOLLOWER = /[一-龥A-Za-z0-9]/; // 会顶开闭合的字
const PUNCT_END = /[。！？：；，、）】》"']/;

let fixA = 0, fixB = 0;
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + e.name;
    if (e.isDirectory()) walk(p);
    else if (/\.(mdx|md)$/.test(e.name)) files.push(p);
  }
}
roots.forEach(walk);

for (const f of files) {
  let t = fs.readFileSync(f, "utf8");
  const before = t;
  // A. **词（gloss）**后跟文字 —— 括注整体移出粗体
  t = t.replace(
    /\*\*([^*\n（]+)（([^（）\n]*)）\*\*(?=[一-龥A-Za-z0-9])/g,
    (_m, word, gloss) => {
      fixA++;
      return `**${word}**（${gloss}）`;
    },
  );
  // B. **……句读**后跟文字 —— 句读移出粗体
  t = t.replace(
    /\*\*([^*\n]+?)([。！？：；，、])(\*\*)(?=[一-龥A-Za-z0-9])/g,
    (_m, body, punct, close) => {
      fixB++;
      return `**${body}**${punct}`;
    },
  );
  if (t !== before) {
    fs.writeFileSync(f, t);
    console.log("fixed:", f);
  }
}
console.log(`括注型修复 ${fixA} 处；句读型修复 ${fixB} 处`);