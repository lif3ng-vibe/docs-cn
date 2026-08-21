---
title: "自动改进示例评分器"
description: "这些示例刻意做得小、确定性、零依赖。它们从 stdin 读一个提案 JSON 对象，向 stdout 打印一个 eval 响应 JSON 对象。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/examples/auto-improve-eval/README.md"
---

# 自动改进示例评分器

这些示例刻意做得小、确定性、零依赖。它们从 stdin 读一个提案 JSON 对象，向 stdout 打印一个 eval 响应 JSON 对象。

把它们当模板，不要当通用质量门。真实项目应该把其中的检查替换为项目专属的、适合在自动改进提案暂存之前安全运行的不变量。

```toml
[auto_improve.eval]
enabled = true
command = "python3 docs/examples/auto-improve-eval/score_proposal.py"
timeout_secs = 30
targets = ["_rules", "procedures"]
min_delta = 0.0
```

冒烟测试：

```bash
python3 docs/examples/auto-improve-eval/score_proposal.py < \
  docs/examples/auto-improve-eval/sample-proposal.json
sh docs/examples/auto-improve-eval/score_proposal.sh < \
  docs/examples/auto-improve-eval/sample-proposal.json
```
