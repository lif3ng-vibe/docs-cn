# OpenRig Docs (English)

Unofficial English mirror of [C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig](C:/Users/lif3n/AppData/Local/Temp/openrig-src/openrig). The upstream repo ships markdown only (no docs site) — this site renders that markdown with Starlight.

- Snapshot: `92480f17825c87088dfcdc5b5089e76ec55a4a3b` (2026-09-30) — see `snapshot.json`
- 每页页首横幅与 frontmatter `source` 指向上游源文件（含快照 commit SHA）。

## 刷新（上游有更新时）

```bash
node scripts/new-en-mirror.cjs --config C:/Users/lif3n/src/docs/scripts/en-mirrors/openrig.json
```

内容目录 `src/content/docs/` 是上游的镜子——勿手改，重跑脚本全量覆盖；脚手架文件（本文件、astro.config.mjs 等）可手调。
上游有变化时会产出/更新 `SYNC.md`（中文站补译工单）。

## 本地运行

```bash
npm install
npm run dev     # http://localhost:4321
```
