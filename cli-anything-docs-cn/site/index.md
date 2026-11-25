# CLI-Anything Hub

CLI-Anything Hub 是一个对 Agent 友好的 CLI 工具注册表与包管理器，让 AI Agent 能够发现、安装并驱动 GUI 应用、开发工具、创意软件、Web API 与公共 SaaS 平台。

官方站点：https://clianything.cc

代码仓库：https://github.com/HKUDS/CLI-Anything

PyPI 包：https://pypi.org/project/cli-anything-hub/

## 安装

```bash
pip install cli-anything-hub
```

## Agent Skill

```bash
npx skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y
```

## 命令

```bash
cli-hub list
cli-hub search <query>
cli-hub info <name>
cli-hub install <name>
cli-hub uninstall <name>
cli-hub update <name>
cli-hub launch <name> [args...]
```

## 机器可读资源

- `https://clianything.cc/llms.txt`
- `https://clianything.cc/llms-full.txt`
- `https://clianything.cc/pricing.md`
- `https://clianything.cc/registry.json`
- `https://clianything.cc/public_registry.json`
- `https://clianything.cc/openapi.json`
- `https://clianything.cc/.well-known/agent.json`
- `https://clianything.cc/.well-known/agent-card.json`
- `https://clianything.cc/.well-known/ai-plugin.json`
- `https://clianything.cc/.well-known/agent-skills/index.json`
- `https://reeceyang.sgp1.cdn.digitaloceanspaces.com/SKILL.md`

## 版权

版权所有：HKUDS。第一作者：Yuhao Yang（yuhao.page）。
