---
title: "站点技能"
---


> **范围**：站点技能（domain skills）是 gstack 自研浏览器引擎（`$B`）的特性，是 Aside 浏览器缺席时（Linux、Windows、Aside 应用已关闭）运行的**回退**方案。驱动 Aside 的技能改用 `/learn` 记录逐项目学习记录（learnings）。参见 [BROWSER.md](/browser/)。

agent 为自己写下的逐站点笔记。它跨会话复利：一旦 agent 弄清了某个网站不显眼的门道，它就保存一条技能，未来在同一主机上的会话会把这条笔记注入自己的提示上下文。

这是 gstack 对 [browser-use/browser-harness](https://github.com/browser-use/browser-harness) 的借鉴。gstack 借的是逐站点笔记模式，而**不是**自我修改运行时模式。技能是载入提示的 markdown 文本，不是可执行代码。

## agent 如何使用它

```bash
# agent 在任务成功后写下它对该站点的了解。
# 主机名自动取自当前活动标签页（无需 agent 传参）。
echo "# LinkedIn Apply Button

The Apply button on /jobs/view pages is inside an iframe with a class
matching 'jobs-apply-button-iframe'. Use \$B frame --url 'apply' first,
then snapshot." | $B domain-skill save

# 查看已保存的内容
$B domain-skill list

# 读取某个主机技能的正文
$B domain-skill show linkedin.com

# 在 $EDITOR 中交互式编辑
$B domain-skill edit linkedin.com

# 将活动的逐项目技能提升为全局（跨项目）
$B domain-skill promote-to-global linkedin.com

# 回滚最近一次编辑
$B domain-skill rollback linkedin.com

# 删除（打墓碑——可通过 rollback 恢复）
$B domain-skill rm linkedin.com
```

## 状态机

```
  ┌──────────────┐  3 successful uses        ┌────────┐  promote-to-global   ┌────────┐
  │ quarantined  │ ─────────────────────▶  │ active │ ──────────────────▶  │ global │
  │ (per-project)│  (no classifier flags)   │(project)│  (manual command)    │        │
  └──────────────┘                          └────────┘                      └────────┘
         ▲                                       │
         │  classifier flag during use           │  rollback (version log)
         └───────────────────────────────────────┘
```

新保存的技能以**隔离**（quarantined）状态落地，不会在提示中自动触发。在该主机上使用 3 次且 L4 ML 分类器未标记技能内容后，技能自动提升为项目内**活动**（active）状态。活动技能会在该主机名的每个新 sidebar-agent 会话中触发。

要让技能跨项目触发（例如"我想让我写的每条 LinkedIn 技能在所有 gstack 项目里生效"），需显式运行 `$B domain-skill promote-to-global <host>`。这是有意为之的可选项（Codex T4 外部评审的结论）：一刀切的跨项目复利会把上下文泄漏到无关工作之间。

## 存储

技能存放在两处：

- **逐项目**：`~/.gstack/projects/<slug>/learnings.jsonl` —— 与 `/learn` 技能用的是同一个 JSONL 文件。站点技能是其中的 `type:"domain"` 行。
- **全局**：`~/.gstack/global-domain-skills.jsonl` —— 只存 `state:"global"` 行。

两个文件都是仅追加的 JSONL。删除采用墓碑记录；一个空闲时运行的压缩器会周期性重写文件。宽容解析器在读取时丢弃不完整的末行，因此写入中途崩溃不会污染后续读取。

## 安全模型

技能是被载入未来提示上下文的 agent 创作内容，这使它们成为典型的 agent 到 agent 提示注入（prompt injection）载体。方案用多层机制显式应对这一点：

| 层 | 内容 | 位置 |
|-------|------|-------|
| L1-L3 | 数据标记、隐藏元素剥离、ARIA 正则、URL 黑名单 | `content-security.ts`（编译进二进制） |
| L4 | TestSavantAI ONNX 分类器 | `security-classifier.ts`（sidebar-agent，非编译） |
| L4b | Claude Haiku 转录分类器 | `security-classifier.ts`（sidebar-agent） |
| L5 | 金丝雀令牌泄漏检测 | `security.ts` |

L1-L3 检查在**保存时**（守护进程内）运行。L4 ML 分类器在**加载时**（sidebar-agent 内）运行，因此每个把技能载入提示的会话都会重新校验内容。这能捕获仅在分类器模型更新后才会显现的问题。

save 命令从**活动标签页的顶层源**（top-level origin）推导主机名，而不是从 agent 参数推导。这堵上了 Codex 指出的一个混淆代理（confused-deputy）漏洞：否则恶意页面的重定向链可能诱骗 agent 污染另一个域名。

## 错误参考

| 错误 | 原因 | 处置 |
|-------|-------|--------|
| `Save blocked: classifier flagged content as potential injection` | 保存时 L4 得分 ≥ 0.85 | 重写技能，去掉指令式语句后重试。 |
| `Save blocked: <L1-L3 message>` | 保存时命中 URL 黑名单或检出 ARIA 注入 | 检查技能正文中的可疑模式。 |
| `Save failed: empty body` | stdin 或 `--from-file` 未提供内容 | 把 markdown 管道传给 `$B domain-skill save`，或传 `--from-file <path>`。 |
| `Cannot save domain-skill: no top-level URL on active tab` | 标签页是 `about:blank` 或 `chrome://...` | 先 `$B goto <target-site>` 再保存。 |
| `Cannot promote: skill is in state "quarantined"` | 技能尚未自动提升 | 在本项目中使用它，直到 3 次成功运行且无分类器标记。 |
| `Cannot rollback: <host> has fewer than 2 versions` | 只存在一个版本 | 改用 `$B domain-skill rm` 删除。 |

## 遥测

启用遥测（telemetry）时（默认为 `community` 模式，除非另行关闭），以下事件会写入 `~/.gstack/analytics/browse-telemetry.jsonl`：

- `domain_skill_saved {host, scope, state, bytes}`
- `domain_skill_save_blocked {host, reason}`
- `domain_skill_fired {host, source, version}`
- `domain_skill_state_changed {host, from_state, to_state}`（计划中）

只记录主机名——没有正文内容，也没有 agent 文本。可用 `gstack-config set telemetry off` 或 `GSTACK_TELEMETRY_OFF=1` 彻底停用。

## 简而言之：站点技能与原生 CDP 逃生通道

gstack 自研引擎（Aside 不在时的回退路径）中的两个浏览器原语会让 agent 随时间复利：

- **`$B domain-skill save`** —— agent 保存一条逐站点笔记（例如"LinkedIn 的 Apply 按钮在一个 iframe 里"），下次访问该主机名时自动触发。隔离 → 3 次成功使用后转为活动 → 可选地经 `$B domain-skill promote-to-global` 跨项目提升。存储与 `/learn` 的逐项目学习记录文件放在一起。
- **`$B cdp <Domain.method>`** —— 原生 Chrome DevTools Protocol 逃生通道，用于精选命令覆盖不到的罕见场景。默认拒绝：方法必须附一行理由显式加入 `browse/src/cdp-allowlist.ts`。双层互斥锁把浏览器级 CDP 调用与逐标签页操作串行化。数据外传类方法的输出包裹在 UNTRUSTED 信封中。

> 想要没有护栏、没有白名单、没有守护进程的原生 CDP——只有 agent 到 Chrome 的薄传输层？[browser-use/browser-harness-js](https://github.com/browser-use/browser-harness-js) 是另一种哲学（agent 自写助手 vs gstack 的精选命令），如果你不想要 gstack 的安全栈，它是合适的选择。两者可以共存：gstack 的 `$B cdp` 与 harness 都能经 Playwright 的 `newCDPSession` 挂到同一个 Chrome 上。
