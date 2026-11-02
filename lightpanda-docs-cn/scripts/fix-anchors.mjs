// 锚点回修：.anchor-maps 映射表 → 重写 src/content 内链锚点。
// 用法：node scripts/fix-anchors.mjs
// 映射行：原英文标题 | 中文标题 | 新锚点（首行表头自动跳过）
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'src/content')
const MAPS = path.join(ROOT, '.anchor-maps')

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
// github-slugger 规则（英文标题 → 旧锚点）：小写、去标点（不替换为连字符）、每个空格各转一个 -
function slug(en) {
  return en.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/ /g, '-')
}

// 全站内容文件清单（相对 CONTENT 的 posix 路径）
const relFiles = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.mdx?$/.test(e.name)) relFiles.push(path.relative(CONTENT, p).replace(/\\/g, '/'))
  }
})(CONTENT)
// 源文件路由：core-concepts/benchmarks.mdx → /core-concepts/benchmarks；x/index.mdx → /x；index.mdx → /
function routeOfRel(rel) {
  const noExt = rel.replace(/\.mdx$/, '')
  return '/' + (noExt === 'index' ? '' : noExt.replace(/\/index$/, ''))
}
const base = r => r.split('/').pop().replace(/\.mdx$/, '')
const dirOf = r => (r.includes('/') ? r.slice(0, r.lastIndexOf('/')) : '')

// 各批次允许的目录范围
const BATCH_DIRS = {
  batch1: ['', 'core-concepts', 'quickstarts', 'run-on-lightpanda-cloud'],
  batch2: ['guides', 'usage'],
  batch3: ['run-locally', 'reference'],
}

// 映射文件 → 源文件路由
function resolveMapRoute(mapRel) {
  // mapRel 如 batch2/bidi-puppeteer.mdx.map.md
  const m = mapRel.match(/^(batch\d+)\/(.+)\.map\.md$/)
  if (!m) return null
  const [, batch, name] = m
  const dirs = BATCH_DIRS[batch]
  if (!dirs) return null
  const n = name.replace(/\.mdx$/, '')
  const inScope = r => dirs.some(d => (d === '' ? dirOf(r) === '' : (dirOf(r) === d || dirOf(r).startsWith(d + '/'))))
  const scope = relFiles.filter(inScope)
  // 1) 纯 basename 匹配
  let hits = scope.filter(r => base(r) === n)
  // 2) 目录前缀连字符形态：bidi-puppeteer → 父目录以 bidi 结尾 + basename puppeteer
  if (!hits.length && n.includes('-')) {
    for (let i = 1; i < n.length; i++) {
      if (n[i] !== '-') continue
      const d = n.slice(0, i)
      const b = n.slice(i + 1)
      hits = scope.filter(r => (dirOf(r) === d || dirOf(r).endsWith('/' + d)) && base(r) === b)
      if (hits.length) break
    }
  }
  return hits.length === 1 ? routeOfRel(hits[0]) : (console.log('AMBIG/MISS: ' + mapRel + ' -> ' + hits.join(',')), null)
}

// route → Map(旧锚点 → 新锚点)
const routeIndex = new Map()
const mapFiles = []
;(function walk(d) {
  if (!fs.existsSync(d)) return
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.map.md')) mapFiles.push(p)
  }
})(MAPS)

for (const mf of mapFiles) {
  const route = resolveMapRoute(path.relative(MAPS, mf).replace(/\\/g, '/'))
  if (!route) continue
  const old2new = new Map()
  for (const line of fs.readFileSync(mf, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.startsWith('原英文标题')) continue
    const parts = line.split('|').map(s => s.trim())
    if (parts.length < 3) continue
    const oldA = slug(parts[0])
    const newA = parts[2]
    if (oldA && newA && oldA !== newA) old2new.set(oldA, newA)
  }
  if (old2new.size) {
    if (routeIndex.has(route)) routeIndex.get(route).forEach((v, k) => old2new.set(k, v))
    routeIndex.set(route, old2new)
  }
}

let nSelf = 0
let nCross = 0
for (const rel of relFiles) {
  const f = path.join(CONTENT, rel)
  let src = fs.readFileSync(f, 'utf8')
  const selfRoute = routeOfRel(rel)
  // 本页锚点 ](#old)
  const selfMap = routeIndex.get(selfRoute)
  if (selfMap) {
    for (const [o, nw] of selfMap) {
      const re = new RegExp('(\\]\\(#)' + esc(o) + '\\)', 'g')
      src = src.replace(re, (m2, p1) => { nSelf++; return p1 + nw + ')' })
    }
  }
  // 跨页锚点 ](/route#old)
  for (const [route, m] of routeIndex) {
    const rEsc = esc(route)
    for (const [o, nw] of m) {
      const re = new RegExp('(\\]\\(' + rEsc + '#)' + esc(o) + '\\)', 'g')
      src = src.replace(re, (m2, p1) => { nCross++; return p1 + nw + ')' })
    }
  }
  fs.writeFileSync(f, src)
}
console.log('self-page anchors fixed: ' + nSelf)
console.log('cross-page anchors fixed: ' + nCross)
console.log('routes in index: ' + routeIndex.size)
