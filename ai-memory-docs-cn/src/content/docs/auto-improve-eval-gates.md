---
title: "自动改进评审门（Eval Gates）"
description: "[auto_improve.eval] 让操作者用一个小型可执行评分器守卫高影响的自动改进提案。评分器在 LLM 验证之后、暂存或自动批准之前运行。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/auto-improve-eval-gates.md"
---

# 自动改进评审门（Eval Gates）

`[auto_improve.eval]` 让操作者用一个小型可执行评分器守卫高影响的自动改进提案。评分器在 LLM 验证之后、暂存或自动批准之前运行。钩子绝不运行 eval 命令。

## 配置

```toml
[auto_improve.eval]
enabled = true
command = "python3 docs/examples/auto-improve-eval/score_proposal.py"
timeout_secs = 30
targets = ["_rules", "procedures"]
min_delta = 0.0
```

命令按空白切分并直接执行，不经过 shell。需要引号、环境设置或多个命令时用包装脚本。

## 请求契约

评分器从 stdin 收一个 JSON 对象：

```json
{
  "path": "procedures/release.md",
  "kind": "procedure",
  "operation": "update",
  "edit_mode": "patch",
  "title": "Release Procedure",
  "confidence": 0.91,
  "rationale": "Capture the repeated release checklist.",
  "before_body": "# Release Procedure\n\n## Steps\n- Run tests\n",
  "after_body": "# Release Procedure\n\n## Steps\n- Run tests\n- Run deploy smoke checks\n",
  "expected_base_body_sha256": "..."
}
```

创建提案的 `before_body` 为空。`expected_base_body_sha256` 只在提案是对照已知基础物化的补丁时出现。

## 响应契约

评分器必须向 stdout 打一个 JSON 对象：

```json
{ "score_before": 0.72, "score_after": 0.76, "passed": true }
```

字段：

- `passed` 必需。`false` 拒绝被门控的提案。
- `score_before` 与 `score_after` 可选。两者都在时，`score_after - score_before` 必须 ≥ `min_delta`。
- `reason` 可选，应用一句话解释拒绝。

命令错误、超时、无效 JSON、缺 `passed`、`passed = false`、分数增量不足，全部对被门控的提案失败关闭。同一运行里的其他提案仍可继续。

## 评分器设计规则

- 评分器保持确定性、快速、无副作用。
- 只读 stdin 与检视安全的本地项目文件。
- 不调 LLM、不改文件、不跑部署、不依赖网络服务。
- 返回有界的 reason；ai-memory 钳制捕获的 eval 证据。
- 优先用与目标路径匹配的简单检查：流程页的标题结构、`_rules` 的禁用占位符、关键文档的项目专属冒烟断言。

## 示例

本仓库带两个零依赖模板：

- [`docs/examples/auto-improve-eval/score_proposal.py`](https://github.com/akitaonrails/ai-memory/blob/main/docs/examples/auto-improve-eval/score_proposal.py)——检查基本结构与占位符的 Python 评分器。
- [`docs/examples/auto-improve-eval/score_proposal.sh`](https://github.com/akitaonrails/ai-memory/blob/main/docs/examples/auto-improve-eval/score_proposal.sh)——内嵌 Python 评分器的 POSIX shell 包装，供偏好脚本入口的宿主。

用示例 payload 试试：

```bash
python3 docs/examples/auto-improve-eval/score_proposal.py \
  < docs/examples/auto-improve-eval/sample-proposal.json

sh docs/examples/auto-improve-eval/score_proposal.sh \
  < docs/examples/auto-improve-eval/sample-proposal.json
```

两者都打印适合 ai-memory eval 门的紧凑 JSON。
