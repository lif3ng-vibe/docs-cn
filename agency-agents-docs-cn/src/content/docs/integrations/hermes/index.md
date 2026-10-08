---
title: 'Hermes 的 agency-agents 路由插件'
---

由 `scripts/convert.sh --tool hermes` 生成。

这个集成安装一个名为 `agency-agents-router` 的 Hermes 插件，而不是
往 `skills.external_dirs` 里塞几百个生成的技能。Hermes 在启动时看到的
是一个固定的小工具面，而完整的代理公司名册存储在磁盘上的
`data/agents.json` 中，按需惰性搜索/加载。

生成智能体数量：279

## 暴露给 Hermes 的工具

- `agency_agents_search`——按查询/部门查找匹配的专家。
- `agency_agents_inspect`——查看某位专家的元数据或完整正文。
- `agency_agents_load`——为当前任务组装一份专家提示词。
- `agency_agents_delegate`——通过 Hermes 公开的子智能体生命周期进行委派。

每个工具都按 Hermes 完整的 function-tool 模式注册，包括其名称、
描述和 JSON `parameters`。可用参数如下：

| 工具 | 参数 |
| --- | --- |
| `agency_agents_search` | `query`（必填），可选 `division` 和 `limit` |
| `agency_agents_inspect` | `agent` 或 `slug`，可选 `include_body` |
| `agency_agents_load` | `agent` 或 `slug`，可选 `task` |
| `agency_agents_delegate` | `agent` 或 `slug`，`task`（必填） |

典型流程：按能力搜索，取一个返回的 `slug`，然后查看、加载或委派给
该专家。你可以用自然语言让 Hermes 做这一切；不要求直接调用工具。

## 给 Hermes 的专家使用指引

当一个 Hermes 项目需要代理公司的专家时，明确要求 Hermes 使用
`agency-agents-router` 插件/路由器，并只加载当前阶段所需的专家。
不要让 Hermes 以技能形式安装或预载完整的代理公司名册。

推荐的项目指引：

```text
Use the agency-agents-router plugin. Search the Agency roster for the right
specialists, then load or delegate only the specific agents needed for each
part of the project. For multi-discipline projects, use multiple selected
specialists across the project, but keep routing lazy: do not preload the
full Agency roster and do not add agency-agents to skills.external_dirs.
```

示例：

```text
For this Data Swami build, use the agency-agents-router plugin to pick
relevant Agency specialists. Search first, then delegate to selected agents
such as frontend, backend, UX, QA, data engineering, and product strategy as
needed. Load/delegate each specialist on demand rather than loading all
Agency agents at startup.
```

## 安装

```bash
./scripts/convert.sh --tool hermes
./scripts/install.sh --tool hermes
```

安装器把生成的插件复制到：

```text
${HERMES_HOME:-~/.hermes}/plugins/agency-agents-router
```

然后在 Hermes 配置中的 `plugins.enabled` 下启用 `agency-agents-router`。
它**不会**写 `skills.external_dirs`。

安装后请重启 Hermes 或开启新会话，让插件及其工具模式被加载。
如果 Hermes 显示这些工具时缺少文档中列出的参数，请从最新的
agency-agents checkout 重新生成并重装插件，然后重启 Hermes。