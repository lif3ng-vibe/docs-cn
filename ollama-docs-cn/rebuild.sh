#!/bin/bash
# rebuild.sh —— ollama-docs-cn 产物全链重建（处理 Windows dist 目录占用）
# 用法: bash rebuild.sh   （产物落 dist/，占用时落 dist-tmp/ 并提示）
set -e
cd "$(dirname "$0")"

echo "== 1/6 export"
npx mintlify export --disable-openapi 2>&1 | tail -1

echo "== 2/6 清理 dist（原生 rmdir 兜底 + 重试）"
for i in 1 2 3; do
  rm -rf dist 2>/dev/null && [ ! -d dist ] && break
  cmd //c "if exist dist rmdir /s /q dist" 2>/dev/null || true
  sleep 2
done
if [ -d dist ]; then
  echo "  ⚠ dist 仍被占用（多为 shell cwd 停在 dist 内），改用 dist-tmp"
  rm -rf dist-tmp
  OUT=dist-tmp
else
  OUT=dist
fi
mkdir -p "$OUT"

echo "== 3/6 解包"
(cd "$OUT" && unzip -qo ../export.zip -x "export.zip" "Start Docs.bat" "Start Docs.command" "serve.js")
rm -f export.zip

echo "== 4/6 inject-theme"
node scripts/inject-theme.mjs "$OUT" | tail -1

echo "== 5/6 pagefind"
npx pagefind --site "$OUT" 2>&1 | grep -E 'Indexed [0-9]+ pages'

echo "== 6/6 prefix-dist"
node scripts/prefix-dist.mjs "$OUT" | tail -1

echo "DONE: $OUT/ 就绪"
