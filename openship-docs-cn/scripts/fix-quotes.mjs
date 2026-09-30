// 修复 JSX 属性内嵌直引号（MDX 编译错误）——用 “” 弯引号替换属性内的直引号。
// 只处理指定文件的指定行模式；ASCII-only 源码，避免传输损坏。
import fs from "node:fs";

const LQ = "“"; // "
const RQ = "”"; // "

const fixes = [
  {
    file: "apps/web/content/docs/getting-started/core-concepts.mdx",
    from: 'title="只有"server"运行时才需要添加服务器"',
    to: 'title="只有' + LQ + 'server' + RQ + '运行时才需要添加服务器"',
  },
  {
    file: "apps/web/content/docs/getting-started/first-deployment.mdx",
    from: 'title="仓库列表为空 / "Connect GitHub" 按钮反复出现"',
    to: 'title="仓库列表为空 / ' + LQ + 'Connect GitHub' + RQ + ' 按钮反复出现"',
  },
];

for (const f of fixes) {
  let text = fs.readFileSync(f.file, "utf8");
  if (!text.includes(f.from)) {
    console.log("PATTERN NOT FOUND:", f.file);
    continue;
  }
  text = text.replace(f.from, f.to);
  fs.writeFileSync(f.file, text);
  console.log("fixed:", f.file);
}
