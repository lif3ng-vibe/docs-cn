---
title: "迁移约定之前的 rig 拓扑上下文"
---

适用于手写上下文早于链文件约定、且位于旧位置（`~/.openrig/shared-docs/rigs/<rig>/`，或 `$OPENRIG_SHARED_DOCS_ROOT/rigs/<rig>/`）的 rig。这里没有任何破坏性操作：旧树原地保留，读取全程有效（即遍历器会发出提示性告警的回退），且每次复制都遵循 no-clobber（不覆盖）。

## 迁移路径与确切命令

```bash
# 0. Know both roots — never hardcode either.
DEST="$(rig config get topology.root)"
SRC="${OPENRIG_SHARED_DOCS_ROOT:-$HOME/.openrig/shared-docs}/rigs"

# 1. BEFORE: prove the fallback is carrying this rig (expect ADVISORY lines
#    on stderr for every level that resolves at the legacy location).
rig context trace --rig <rig> --seat <seat> --name LEARNED.md

# 2. Preview the migration (dry run — nothing moves).
rsync -av --ignore-existing --exclude 'state/' --dry-run "$SRC/<rig>/" "$DEST/rigs/<rig>/"

# 3. Migrate. --ignore-existing mirrors the installer's copy-if-absent law:
#    anything already earned under topology.root is never overwritten.
mkdir -p "$DEST/rigs/<rig>"
rsync -av --ignore-existing --exclude 'state/' "$SRC/<rig>/" "$DEST/rigs/<rig>/"

# 4. AFTER: the same trace now resolves canonically — the advisories are gone.
rig context trace --rig <rig> --seat <seat> --name LEARNED.md

# 5. Do NOT delete the legacy tree in the same session. Archive it later,
#    once every consumer (queue-state add-dirs, review artifacts, scripts)
#    has been confirmed off it — reads through the fallback stay correct in
#    the meantime, which is the point of fail-open.
```

## 什么会迁移，什么不会

- **会迁移**：该 rig 的链文件与席位目录——`LEARNED.md`、`CULTURE.md`、手艺（craft）文件、`seats/<seat>/…`。
- **暂且留下**：`state/`（队列状态 add-dirs 与活跃工件由运行中的席位持续写入；把它们挪到活着的 rig 之下会让写入者搁浅——那次切换是独立的变更，有自己的回执）。
- **绝不**：把任何东西塞进运行中席位的上下文。迁移移动的是文件；向运行中席位的交付走的是 refocus 通道（`docs/reference/refocus-channel.md`）——编辑文件不是交付。

## 迁移之后

随附拓扑默认值的 spec 在下一次 `rig up` 时，会以 copy-if-absent 方式把它们装到已迁移内容旁边——挣来的上下文永远胜过随附默认值。有任何疑虑就用追溯来验证，不要靠记忆。
