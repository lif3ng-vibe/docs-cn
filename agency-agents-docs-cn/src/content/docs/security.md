---
title: '安全策略'
---

# 安全策略

## 报告漏洞

如果你发现本项目存在安全漏洞，请负责任地报告。不要为安全漏洞开公开的 GitHub issue。请通过 GitHub 的 Security 标签页发起私密安全公告（security advisory）。

## 响应时限

- 确认：48 小时内
- 初步评估：7 天内
- 修复或缓解：视严重程度而定

## 范围

本仓库包含基于 Markdown 的智能体定义，以及用于安装和转换的 shell 脚本。

### 智能体文件（.md）
- 不可执行的提示词定义
- 智能体文件中不应存放任何 API key、密钥或凭据

### Shell 脚本（scripts/）
- install.sh、convert.sh 和 lint-agents.sh 是可执行文件
- 贡献者在运行前应审查脚本是否存在非预期行为

## 贡献者最佳实践

- 绝不提交 API key、token 或凭据
- 绝不在智能体 Markdown 文件里放可执行代码
- shell 脚本合并前必须经过审查
- 发现疑似提示词注入（prompt injection）的智能体定义，请举报