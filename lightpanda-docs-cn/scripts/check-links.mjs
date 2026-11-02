// 产物级锚点校验：抓 out/ 全部 html 的页内/跨页锚点链接，与目标页 id 配对。
// 用法：node scripts/check-links.mjs [outDir]
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve(process.cwd(), process.argv[2] || 'out')
const BASE = '/docs-cn/lightpanda'

// 收集每个 html 文件的 id 集合
function* htmlFiles(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) {
      if (e.name === '_next' || e.name === '_pagefind') continue
      yield* htmlFiles(p)
    } else if (e.name.endsWith('.html')) yield p
  }
}

const idsByPage = new Map() // 页面路径（/ 开头，无 .html）→ Set(id)
for (const f of htmlFiles(OUT)) {
  const rel = path.relative(OUT, f).replace(/\\/g, '/').replace(/\.html$/, '')
  const page = rel === 'index' ? '/' : '/' + rel
  const html = fs.readFileSync(f, 'utf8')
  const ids = new Set()
  for (const m of html.matchAll(/id="([^"]+)"/g)) ids.add(m[1])
  idsByPage.set(page, ids)
}

// 上游固有的断锚（镜像忠实保留，不视为本次翻译引入的问题）
const WHITELIST = new Set([
  '/404', // not-found 页无 nextra skip-nav 锚点（上游同样如此）
])
const WHITELIST_LINK = new Set(['/docs-cn/lightpanda/reference/mcp-tools#session']) // 上游 usage/mcp 链接到 mcp-tools 不存在的锚点

let bad = 0
for (const [page] of idsByPage) {
  if (WHITELIST.has(page)) continue
  const f = page === '/' ? path.join(OUT, 'index.html') : path.join(OUT, page + '.html')
  const html = fs.readFileSync(f, 'utf8')
  // 跨页锚点：href="/docs-cn/lightpanda/xxx#frag"；本页：href="#frag"
  for (const m of html.matchAll(/href="(\/docs-cn\/lightpanda\/[^"#]*)#([^"]+)"/g)) {
    const target = m[1].slice(BASE.length) || '/'
    const frag = decodeURIComponent(m[2])
    if (WHITELIST_LINK.has(m[1] + '#' + frag)) continue
    const ids = idsByPage.get(target)
    if (!ids) {
      console.log('NOPAGE ' + page + ' -> ' + m[1])
      bad++
    } else if (!ids.has(frag)) {
      console.log('NOANCHOR ' + page + ' -> ' + m[1] + '#' + frag)
      bad++
    }
  }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    const frag = decodeURIComponent(m[1])
    const ids = idsByPage.get(page)
    if (!ids.has(frag)) {
      console.log('NOSELF ' + page + ' -> #' + frag)
      bad++
    }
  }
}
console.log(bad ? 'BROKEN: ' + bad : 'ALL-ANCHORS-OK')
process.exit(bad ? 1 : 0)
