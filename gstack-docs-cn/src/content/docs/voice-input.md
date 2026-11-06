---
title: "语音输入（AquaVoice、Whisper 等）"
---


许多 gstack 技能在模板中列出了语音转文字别名（`voice-triggers:`）：`/cso` 对应 "security check"，`/qa` 对应 "run QA" 或 "test the app"，`/plan-eng-review` 对应 "tech review"。只要自然地说出其中一句，即使不喊 slash command 名称也能选中正确的技能。在 Claude Code 上，这些别名是根 `/gstack` 路由技能中的路由行；在 Codex 及其他宿主上，它们被追加到各技能的 description 末尾，宿主正是凭它来匹配。

技能 frontmatter 中单独的 `triggers:` 列表是 gstack 元数据，并不参与匹配。Claude Code 与 Codex 依据技能的名称和 description 来挑选技能，因此只出现在 `triggers:` 之下的短语不会激活该技能（Codex 的产出会丢弃该字段；GBrain 宿主则保留）。四个核心技能（/office-hours、/review、/qa、/ship）把各自的 `triggers:` 短语直接写进了 description：完整 description 中包含全部短语，Claude Code 读取的单行目录条目中也至少含有一个（/qa 的 "test the site"，/ship 的 "ship it"）。其他技能则不然，因为在 `core` 默认层级下，它们要等你亲手输入才会响应（docs/proactive.md）。
