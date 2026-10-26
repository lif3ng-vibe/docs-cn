---
title: Claude Code 兼容性
sidebar_label: Claude Code 兼容性
---

import ClaudeCodeCompatibilityTable from '@site/src/components/ClaudeCodeCompatibilityTable';

# Claude Code × LiteLLM 兼容性矩阵

这张表格由一个自动化填充程序每天重新生成：它会让 [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) 对最新的正式 LiteLLM 版本（最新的纯 `vX.Y.Z` 标签）在各受支持的提供商上运行测试，Haiku 4.5、Sonnet 4.6 和 Opus 4.7 三个模型档位并行进行。只有三档全部通过，单元格才会变绿。

<ClaudeCodeCompatibilityTable />

## 图例

| 符号 | 含义 |
| --- | --- |
| ✅ | 该 `(feature, provider)` 单元格的三个模型档位全部通过。 |
| ❌ | 至少一个模型档位未通过。悬停可查看上游报错。 |
| — | 该组合未运行测试。 |
| n/a | 不适用（例如提供商不提供此功能）。悬停可查看原因。 |

## 数据来源

矩阵 JSON 数据存放在 [`src/data/compatibility-matrix.json`](https://github.com/BerriAI/litellm-docs/blob/main/src/data/compatibility-matrix.json)。填充程序位于主仓库的 [`tests/e2e/claude_code/cron_vm/`](https://github.com/BerriAI/litellm/tree/main/tests/e2e/claude_code/cron_vm) 目录。
