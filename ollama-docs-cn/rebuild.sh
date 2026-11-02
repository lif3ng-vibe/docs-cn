#!/bin/bash
# rebuild.sh —— ollama-docs-cn 产物全链重建（唯一构建入口，CI 与本地同一份）
# 产物先落 dist-tmp/（Windows 下 dist 常被 shell cwd/进程锁死），完成后换名 dist。
#
# 关键背景：mintlify export 的云渲染偶发「坏轮」——页面路由上下文被渲染成
# data-current-path="/"（flight 全部失效），水合时客户端按 current-path 匹配
# 全部失败 → 页面渲染 404 插画 / 布局塌陷 / 软导航弹根。所以 export 后必须
# 健康校验（抽检 data-current-path），不健康自动重试。
set -e
cd "$(dirname "$0")"

OUT=dist-tmp
BASE=/docs-cn/ollama
echo "== 1/4 export + 完整性校验（云渲染偶发坏轮；判据=页数+关键页文件存在，水合健康由浏览器冒烟验证）"
for attempt in 1 2 3; do
  rm -rf "$OUT" 2>/dev/null || true
  mkdir -p "$OUT"
  npx mintlify export --disable-openapi 2>&1 | tail -1
  (cd "$OUT" && unzip -qo ../export.zip -x "export.zip" "Start Docs.bat" "Start Docs.command" "serve.js")
  rm -f export.zip
  pages=$(find "$OUT" -name index.html | wc -l)
  ok=0
  for f in quickstart/index.html cli/index.html api/introduction/index.html integrations/index.html; do
    [ -f "$OUT/$f" ] && ok=$((ok+1))
  done
  if [ "$pages" -ge 72 ] && [ "$ok" -ge 4 ]; then
    echo "  export 完整（$pages 页，关键页 $ok/4）"
    break
  fi
  echo "  ⚠ export 不完整（$pages 页 / 关键页 $ok/4），重试 $attempt/2"
  [ "$attempt" = 3 ] && { echo "连续 3 轮不完整，保留最后产物供检查，退出"; exit 1; }
done

echo "== 2/4 inject-theme（theme.css/搜索弹层/图标资产/lang=zh-CN/sitemap/llms.txt）"
node scripts/inject-theme.mjs "$OUT" | tail -1

echo "== 3/4 pagefind（html 已是 zh-CN，自动 zh 索引；force-language 保险）"
npx pagefind --site "$OUT" --force-language zh 2>&1 | grep -E 'Discovered|Indexed [0-9]+ pages'

echo "== 4/4 prefix-dist（HTML 属性 + flight 修补 + canonical/og）"
node scripts/prefix-dist.mjs "$OUT" | tail -1

rm -rf dist 2>/dev/null || true
if [ ! -d dist ] && mv "$OUT" dist 2>/dev/null; then
  echo "DONE: dist/ 就绪"
else
  echo "DONE: dist/ 被占用未换名，产物在 $OUT/"
fi