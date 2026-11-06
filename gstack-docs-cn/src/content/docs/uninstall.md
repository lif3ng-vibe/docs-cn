---
title: "卸载"
---


## 方案 1：运行卸载脚本

如果 gstack 装在你的机器上：

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
```

它会处理技能、符号链接、宿主注册（`gstack-harness` 写进 OpenClaw、Hermes、某个 Dot 或其他宿主的文件——依据各自的台账——外加可选开启的[启动 hook](/hosts/#start-hook)，通过宿主自己的 CLI 关掉）、全局状态（`~/.gstack/`）、项目本地状态、browse 守护进程和临时文件。用 `--keep-state` 保留配置和分析数据。用 `--force` 跳过确认。

## 方案 2：手动移除（本地没有仓库）

如果你没有 clone 仓库（比如当初是经 Claude Code 粘贴安装的，后来删掉了 clone）：

```bash
# 1. 停止 browse 守护进程
pkill -f "gstack.*browse" 2>/dev/null || true

# 2. 移除 SKILL.md 指向 gstack/ 的各技能目录
#    （用 rm -rf 而非 rmdir——装好的目录里还有运行时资源链接）
find ~/.claude/skills -mindepth 1 -maxdepth 1 -type d ! -name gstack 2>/dev/null |
while IFS= read -r dir; do
  link="$dir/SKILL.md"
  [ -L "$link" ] || continue
  target=$(readlink "$link" 2>/dev/null) || continue
  case "$target" in
    gstack/*|*/gstack/*)
      rm -rf "$dir"
      ;;
  esac
done
# gstack 创建的目录带有 .gstack-owned 标记（这是 Windows 上唯一的信号，
# 那里的安装是文件复制，没有符号链接可读）
for marker in ~/.claude/skills/*/.gstack-owned; do
  [ -f "$marker" ] && rm -rf "$(dirname "$marker")"
done
# 别名技能以副本安装（没有符号链接可检测）——按名字移除
rm -rf ~/.claude/skills/_gstack-command ~/.claude/skills/connect-chrome 2>/dev/null

# 3. 移除 gstack
rm -rf ~/.claude/skills/gstack

# 4. 移除全局状态
rm -rf ~/.gstack

# 5. 移除各集成（从未装过的跳过）
rm -rf "${CODEX_HOME:-$HOME/.codex}/skills/gstack"* 2>/dev/null
rm -rf ~/.factory/skills/gstack* 2>/dev/null
rm -rf ~/.kiro/skills/gstack* 2>/dev/null
rm -rf "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/skills/gstack"* "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}/skills/.gstack-skills" 2>/dev/null
rm -rf "${HERMES_HOME:-$HOME/.hermes}/skills/gstack" 2>/dev/null
rm -rf ~/.cursor/skills/gstack* 2>/dev/null
rm -rf ~/.config/opencode/skills/gstack* 2>/dev/null
rm -rf ~/.gemini/antigravity-cli/skills/gstack* 2>/dev/null
rm -rf ~/.gemini/skills/gstack* 2>/dev/null

# 6. 移除临时文件
rm -f /tmp/gstack-* 2>/dev/null

# 7. 按项目清理（在每个项目根目录下运行）
rm -rf .gstack .gstack-worktrees .claude/skills/gstack 2>/dev/null
rm -rf .agents/skills/gstack* .factory/skills/gstack* 2>/dev/null
```

手动移除会把 gstack 的 hook 条目留在 `~/.claude/settings.json` 里（卸载
脚本会替你全部清掉，包括 `_gstack_source` 标签被剥掉的条目）。编辑该文件，
删除每一条命令路径指向 `.claude/skills/gstack/` 的 hook：SessionStart 自动
更新 hook、AskUserQuestion PreToolUse/PostToolUse hook，以及 Stop hook
（会话时间线，外加你选择开启过的 verify-gate）。留着不删的话，安装目录
一旦消失，它们会在每个匹配事件上报错。

如果你开启过 OpenClaw 或 Hermes 的[启动 hook](/hosts/#start-hook)，手动
移除还会让它的 `gstack-start` 插件保持开启。用
`openclaw config unset plugins.entries.gstack-start` 或 `hermes plugins
disable gstack-start` 关掉，然后删除
`${OPENCLAW_STATE_DIR:-~/.openclaw}/extensions/gstack-start` 或
`${HERMES_HOME:-~/.hermes}/plugins/gstack-start`。

## 清理 CLAUDE.md

卸载脚本不会编辑 CLAUDE.md。在每个加过 gstack 的项目里，把 `## gstack` 和 `## Skill routing` 两节删掉。

## Playwright

`~/Library/Caches/ms-playwright/`（macOS）会保留原样，因为其他工具可能共用它。确认没别的东西需要后可以手动删掉。

## Aside

gstack 从不安装 Aside，所以也从不卸载它。留着或删掉都随你，就像任何其他应用一样。
