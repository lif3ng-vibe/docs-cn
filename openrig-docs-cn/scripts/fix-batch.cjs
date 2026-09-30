const fs = require('fs');

// 1) check-dist target 去尾斜杠
const f1 = 'scripts/check-dist.mjs';
let s1 = fs.readFileSync(f1, 'utf8');
const t1 = 'const target = path.posix.normalize(joined);';
const n1 = "const target = path.posix.normalize(joined).replace(/\/+$/, '');";
if (s1.includes(t1)) {
  s1 = s1.split(t1).join(n1);
  fs.writeFileSync(f1, s1);
  console.log('1) target 去尾斜杠: 已补');
} else {
  console.log('1) target 已含该形态');
}

// 2) fix-md-links 加 :// 外链守卫
const f2 = 'scripts/fix-md-links.cjs';
let s2 = fs.readFileSync(f2, 'utf8');
const t2 = "    if (linkPath.startsWith('/')) return m;";
const n2 = "    if (linkPath.startsWith('/')) return m;\n    if (linkPath.includes('://')) return m;";
if (s2.includes(t2) && !s2.includes("includes('://')")) {
  s2 = s2.split(t2).join(n2);
  fs.writeFileSync(f2, s2);
  console.log('2) :// 守卫: 已补');
} else {
  console.log('2) :// 守卫: 已存在或形态不符');
}

// 3) 修复被误加前缀的 GitHub 外链（4 处）
const files = [
  'src/content/docs/releases/v0.4.6.md',
  'src/content/docs/releases/v0.5.15.md',
  'src/content/docs/releases/v0.5.17.md',
  'src/content/docs/releases/v0.6.0.md',
];
let fixed = 0;
const badPrefix = '](/releases/https:/github.com';
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes(badPrefix)) {
    s = s.split(badPrefix).join('](https://github.com');
    fs.writeFileSync(file, s);
    fixed++;
  }
}
console.log('3) GitHub 外链前缀修复: ' + fixed + ' 文件');
