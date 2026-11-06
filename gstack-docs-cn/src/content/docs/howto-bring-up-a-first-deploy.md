---
title: "如何完成你的第一个生产部署"
---


当 `/setup-deploy` 停在 "Nothing is deployed yet" 时使用本指南。它带你走完
第一次生产部署，让你最终拿到一个线上 URL，`/setup-deploy` 能记录它、
`/land-and-deploy` 能验证它。指南不指定任何托管商或部署工具；哪个适合
你的项目就用哪个。

`/setup-deploy` 在那个停顿点不写任何东西。它配置的是 `/land-and-deploy`
如何检查部署，因此它需要一个已经存在的生产部署。

## 前置条件

- 应用能用生产环境将运行的命令在本地构建并启动。
- 代码已在它的 GitHub 仓库里。`/setup-deploy` 与 `/land-and-deploy`
  通过 GitHub CLI 读取仓库，所以 `gh auth status` 应当通过。
- 在你选定的托管商那里有账号，需要计费的话已设置好。
- 可选：一个你控制的域名，如果用户不会用托管商的默认地址。

## 步骤

### 1. 选择应用在哪里运行

按你的应用类型选宿主：静态文件、长期运行的服务器或容器，或函数。列出
应用在运行时需要什么：语言运行时及其版本、数据库或其他服务、后台任务，
以及任何要在重启后留存的磁盘。

然后决定生产部署如何启动。`/land-and-deploy` 只观察已存在的触发器，
从不创建。当 `/setup-deploy` 问部署由什么触发时，选项有：

- 推送到默认分支时自动触发
- 仓库里的 CI workflow
- 部署脚本或 CLI 命令
- 手动

在合并到默认分支时运行的触发器能让 `/land-and-deploy` 全程免动手。用
命令触发器的话，命令不跑就什么都不会部署：`/land-and-deploy` 会在合并
后请你运行它，或仅在获得你的明确批准后才运行。

### 2. 创建应用依赖的服务

为应用用到的每个服务创建生产实例，比如数据库、缓存、文件存储、邮件或
支付，与你的开发实例分开。在应用接流量之前，先对生产环境执行数据库
schema 初始化或迁移。

### 3. 设置环境变量与秘密

1. 列出应用读取的每个变量，构建时的和运行时的都要。
2. 在宿主的环境或 secrets 设置里逐个设好。
3. 秘密值不进仓库。只提交一个带占位值的示例文件，比如 `.env.example`。
4. 秘密值由你亲手输入。不要把它们粘贴进与 agent 的对话。

有些宿主只在运行时注入变量。构建需要的值（比如公开的客户端 key）必须
在构建运行时就能拿到。

### 4. 跑第一次部署

用你选定的触发器启动一次部署：推送默认分支、运行 workflow，或运行
命令。盯着构建与发布日志直到结束，记下宿主分配的地址。构建失败就先修
好、再部署，然后继续。

### 5. 把域名指过去（可选）

1. 在你的 DNS 服务商处添加宿主要求的记录：子域名通常是一条 CNAME
   记录，根域名是 A 与 AAAA 记录。
2. 等待域名解析生效：

   ```bash
   dig +short app.example.com
   ```

3. 确认该域名的 HTTPS 带有效证书可用：

   ```bash
   curl -sI https://app.example.com | head -1
   ```

决定哪个地址作为生产 URL——你的域名还是宿主的默认地址。那就是你交给
`/setup-deploy` 的 URL。

### 6. 确认它能用

1. 在浏览器打开生产 URL，走通一条真实流程，比如登录或加载数据。
2. 如果应用有健康检查端点，确认它返回 2xx 状态：

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://app.example.com/health
   ```

   一个有用的健康检查端点会实际锻炼应用，比如触达它的数据库，而不是
   返回一个固定页面。
3. 确保你能分辨线上跑的是哪个版本：一条打印已部署 commit 的状态命令，
   或一个展示它的页面/端点。`/land-and-deploy` 把"页面能加载"视作站点
   存活，而不是"合并的 commit 已上线"的证据。
4. 首批请求过后，检查宿主日志有无报错。

### 7. 把部署交还给 gstack

再次运行 `/setup-deploy`。如果项目里现在有它认识的平台的配置文件，它会
从该平台的设置起步；否则它会询问。无论哪种，备好这些答案：

- 部署由什么触发（第 1 步）
- 生产 URL（第 5 步）
- 如何确认部署成功：健康检查 URL、状态命令、CI workflow 的状态，或仅
  确认 URL 能加载
- 你的仓库允许的合并方式（squash、merge 或 rebase），以及合并前要运行
  的任何命令

它会把答案写进项目 CLAUDE.md 的 `## Deploy Configuration` 段落，然后试跑
一次健康检查与状态命令。此后 `/land-and-deploy` 就用该段落来合并你的
PR、观察部署并检查生产环境。它的首次运行会先带你对整条流水线做一次
演练，然后才发生任何不可逆的事。

## 验证

- `/setup-deploy` 以 `DEPLOY CONFIGURATION — COMPLETE` 结束。
- 项目的 CLAUDE.md 里有该段落，带你的生产 URL：

  ```bash
  grep -A 20 "## Deploy Configuration" CLAUDE.md
  ```

- 其健康检查没有打印 `UNREACHABLE`，其状态命令没有打印 `COMMAND_FAILED`。

## 排障

**`/setup-deploy` 再次停在 "Nothing is deployed yet"。**
那个回答的意思是没有可记录的生产部署。应用上线后，选择说明其部署方式的
回答：推送触发、CI workflow、脚本或命令，或手动。

**健康检查失败或打印 `UNREACHABLE`。**
自己打开那个 URL。404 说明健康路径不存在，给 `/setup-deploy` 一个返回
2xx 的路径，或直接给裸的生产 URL。即使这个检查失败，`/setup-deploy`
也会保留配置，你可以稍后重跑它或编辑 CLAUDE.md 里的段落来修正 URL。

**应用在宿主地址上正常，在你的域名上不行。**
检查 DNS 记录（`dig +short <域名>`）与证书（`curl -sI https://<域名>`）。
新记录在各处生效可能需要一点时间。

**构建在本地成功，在宿主上失败。**
对比宿主的构建环境与你的环境。缺失的构建期变量或不同的运行时版本是常见
原因。

**你靠手动运行命令来部署。**
把它记录为部署触发器。每次合并后，`/land-and-deploy` 会告诉你生产还没
动静，并请你运行它。

## 相关

- [`/setup-deploy`](/skills/#setup-deploy) 与 [`/land-and-deploy`](/skills/#land-and-deploy)：两个技能各自做什么
- [`/canary`](/skills/#canary)：生产上线后的部署后监控
- 参考：[`setup-deploy/SKILL.md`](https://github.com/garrytan/gstack/blob/main/setup-deploy/SKILL.md)、[`land-and-deploy/SKILL.md`](https://github.com/garrytan/gstack/blob/main/land-and-deploy/SKILL.md)
