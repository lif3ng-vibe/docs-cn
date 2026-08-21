---
title: "部署 ai-memory 到家庭实验室"
description: "本文走一遍 bin/deploy 记录的模式。最终状态：家庭实验室宿主上一个长驻的 ai-memory 容器，局域网经 http://<host>:49374/mcp 可达。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/deploy.md"
---

# 部署 ai-memory 到家庭实验室（homelab）

本文走一遍 `bin/deploy` 记录的模式。最终状态：家庭实验室宿主上一个长驻的 ai-memory 容器，局域网经 `http://<host>:49374/mcp` 可达，配好你的 LLM/嵌入 API key，备份交给你在 `/var/opt/docker/...` 上已经在用的那套。

想要原生 Linux 服务而非 Docker，用[安装指南的 Arch/AUR systemd 路径](/install/#arch-linux-原生包aur)。那种安装模式下系统服务用 `/var/lib/ai-memory` 加 `/etc/ai-memory/`，用户服务用 XDG 用户路径。下面的 Docker 部署保持容器内 `/data`、宿主上 `/var/opt/docker/...`。

发布的 Docker 镜像含 `linux/amd64` 与 `linux/arm64` manifest，x86_64 与 ARM64 的家庭实验室宿主都能原生拉同一 tag。

## 哪些进 git，哪些留在本地

仓库只带**模板**。装着你家庭实验室细节与 API key 的真实文件在旁边、去掉 `.example` 后缀，且被 gitignore。

| 提交（模板） | 实际使用（gitignored） | 装着什么 |
|---|---|---|
| `bin/deploy` | （脚本本身；可安全提交） | 构建/推送/重启逻辑 |
| `bin/deploy.env.example` | `bin/deploy.env` | `SERVER`、`DEPLOY_DIR`、`IMAGE` |
| `docker/docker-compose.prod.yml.example` | `docker/docker-compose.prod.yml` | 镜像 tag、端口映射、卷路径 |
| `docker/.env.production.example` | `docker/.env.production` | LLM + 嵌入 API key |

`.gitignore` 排除实际使用的文件。若你看到其中之一被 stage 了，说明有漂移——提交前先 unstage。

## 首次设置（一次性）

```bash
# 1. 把你的家庭实验室取值填进本地配置。
cp bin/deploy.env.example bin/deploy.env
$EDITOR bin/deploy.env                # 填 SERVER / DEPLOY_DIR / IMAGE

cp docker/docker-compose.prod.yml.example docker/docker-compose.prod.yml
$EDITOR docker/docker-compose.prod.yml   # 设镜像 tag + 必要时调端口

cp docker/.env.production.example docker/.env.production
$EDITOR docker/.env.production        # 填凭据；选 LLM 提供方（模型覆盖可选）

# 2. 在家庭实验室上创建部署目录。先 source bin/deploy.env，
#    让 SERVER/DEPLOY_DIR 在这个 shell 里导出。
source bin/deploy.env
ssh "$SERVER" "sudo mkdir -p $DEPLOY_DIR/data && \
               sudo chown -R 1000:1000 $DEPLOY_DIR"

# 3. 把 compose + env 拷到家庭实验室。
scp docker/docker-compose.prod.yml "$SERVER:$DEPLOY_DIR/docker-compose.yml"
scp docker/.env.production         "$SERVER:$DEPLOY_DIR/.env.production"

# 4. 跑第一次部署。
bin/deploy
```

第 4 步之后容器应该已经跑起来。验证：

```bash
curl http://<homelab>:49374/mcp
# 预期一个 JSON-RPC 错误（意味着端口可达、服务器有响应）。
# "Connection refused" 说明容器没起来或端口映射不对。

ssh "$SERVER" "docker inspect --format='{{.State.Health.Status}}' ai-memory"
# 预期：healthy
```

## 安全——bearer token 认证 + 加密传输

默认 `docker-compose.prod.yml.example` 绑 `0.0.0.0:49374` 让局域网够得到 MCP 端点。**绑到局域网又无认证的服务器等于让网络上任何人调用破坏性的 MCP 工具**（删除全部页面、注入假观察、掏空你的 LLM 预算）。ai-memory 内置 bearer token 校验；第一次部署前先打开。

```bash
# 1. 生成 token（32 字节 / 64 个十六进制字符）。
ai-memory generate-auth-token >> docker/.env.production
$EDITOR docker/.env.production    # 给新行加上 AI_MEMORY_AUTH_TOKEN= 前缀

# 2. 同步到家庭实验室 + 重启。
scp docker/.env.production "$SERVER:$DEPLOY_DIR/.env.production"
ssh "$SERVER" "cd $DEPLOY_DIR && docker compose up -d"
```

启动日志现在会显示 `auth=true`。从笔记本验证：

```bash
curl -sI http://homelab:49374/handoff             # → HTTP/1.1 401 Unauthorized
curl -sI http://homelab:49374/handoff \
     -H "Authorization: Bearer $TOKEN"            # → HTTP/1.1 200 OK
```

**然后更新每个 MCP 客户端**发送同一 token。[README 支持矩阵](/#支持矩阵)里的每个客户端，`ai-memory install-mcp --client <name> --auth-token <token>` 都打印确切片段；可运行 `ai-memory install-mcp --help` 看当前接受的取值。智能体 CLI 每次调用都发 `Authorization: Bearer <token>` 头；ai-memory 中间件以常数时间比较校验。

**加密传输。** 局域网上的明文 HTTP 意味着任何抓包的人都能读到传输中的 bearer token（开多用户后还有各用户的 token）。绑到环回之外或开启多用户时，在 ai-memory 前面加一个 TLS 终结的反向代理——Caddy + Let's Encrypt、Caddy 内部 CA、Cloudflare Tunnel、nginx 或外部证书文件。

**完整部署指南见[通过反向代理上 HTTPS](/https-via-proxy/)**，包括：

- 何时加 TLS、何时跳过（环回 + stdio 两种情形确实不需要）。
- 可直接复制的 docker compose 模板：[Caddy](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.caddy.yml) 与 [Cloudflare Tunnel](https://github.com/akitaonrails/ai-memory/blob/main/docker/compose.tls.cloudflared.yml)。
- 内部 CA 路径的各操作系统信任库安装（承重的手工步骤）。
- ai-memory 与其他应用共享主机名时，经 `--base-path` / `AI_MEMORY_BASE_PATH` [挂在子路径下](/https-via-proxy/#挂在子路径下hosting-under-a-subpath)。
- 明确的「哪里会出问题」小节，免得你无意间上线安全表演。

对单用户环回的快速开始，只有 bearer token 仍然可接受——token 挡住局域网邻居，环回挡住抓包。部署形态一旦不再是「单用户单机」，TLS 就开始值回票价。

## 日常部署

首次设置之后，后续每次部署只是：

```bash
bin/deploy
```

它本地构建镜像、推到你的 registry、家庭实验室上拉取、重启。家庭实验室上的 compose 文件 + env 文件在部署之间不变；需要改时 scp 新副本 + 重跑 `bin/deploy`。

## 更新 API key

```bash
$EDITOR docker/.env.production
scp docker/.env.production "$SERVER:$DEPLOY_DIR/.env.production"
ssh "$SERVER" "cd $DEPLOY_DIR && docker compose up -d"
```

`docker compose up -d` 读取 env 文件并以新值重建容器。无需重新构建。

## LLM 提供方选择

`.env.production.example` 默认 **OpenRouter 上的 Kimi 2.6**（openai-compat 传输，每百万 token $0.73/$3.49）。合理的替代：

| 提供方 | 模型 | 约每次整编成本 | 说明 |
|---|---|---|---|
| anthropic | `claude-haiku-4-5` | ~$0.02 | **推荐默认。** 速度、克制与分类质量的最佳平衡。不是推理模型。 |
| openai-compat（OpenRouter） | `moonshotai/kimi-k2.6` | ~$0.013 | 推理模型；每次整编延迟约 2-3 分钟。整编是即发即忘的所以无妨。 |
| openai | `gpt-5.4-mini` | ~$0.002 | 更便宜更快的替代。质量尚可。 |
| openai-oauth | `gpt-5.5` | ChatGPT 订阅 | ChatGPT/Codex 后端。在服务器宿主上跑 `docker exec -it ai-memory ai-memory auth login openai-oauth`，让 `<data_dir>/auth.json` 落进挂载的数据卷。 |
| copilot | `gpt-5.5` | GitHub Copilot 订阅 | GitHub Copilot Chat 后端。在服务器宿主上跑 `docker exec -it ai-memory ai-memory auth login copilot` 或设 `COPILOT_GITHUB_TOKEN`。 |
| gemini | `gemini-3.5-flash` | 免费额度够个人用 | Google 托管，原生 `responseSchema` 结构化输出。设 `GEMINI_API_KEY`（或 `GOOGLE_API_KEY`）。 |
| openai-compat（Ollama） | `qwen3:32b` | $0 | 自托管。设 `AI_MEMORY_LLM_BASE_URL=http://host.docker.internal:11434/v1`。质量取决于模型。 |

> **不推荐：** 推理模式模型（推理模式的 Kimi-K2.6、开 extended thinking 的 Claude、GPT-o3、Gemini "thinking" 变体）——它们先在内部推理上烧 token 预算再输出，遇到严格 JSON 的整编提示词会挂起或输出空响应。非用不可就关掉推理。

ai-memory 的托管 OpenAI 系提供方对结构化输出用 `json_schema` 严格模式。OpenAI 提供方把 schemars 输出归一化进 OpenAI 支持的子集（`additionalProperties: false`、完整的 `required`、生成的枚举 `anyOf`、普通 `$ref` 节点）。`openai-compat` 本地与网关端点默认用同样的 schema 约束请求，对显式能力拒绝或畸形输出有宽容回退。不兼容的端点设 `AI_MEMORY_LLM_COMPAT_STRICT=false`。换冷门本地模型时，先跑一次 `ai-memory llm-test` 再信任它。

每个聊天提供方把单次 HTTP 请求限制在 300 秒。慢的托管网关（在免费聚合层上观察到过）可能把长补全流过这个上限，导致每个请求都以 `http: error sending request` 失败；在容器环境里调大 `AI_MEMORY_LLM_TIMEOUT_SECS` 以匹配网关最坏情况的生成时间。

## 备份

数据目录就是你在 `docker-compose.prod.yml` 里挂载的（默认：`/var/opt/docker/utils/ai-memory/data/`）。包含：

```
data/
├── wiki/    # markdown——用 rsync 备份或 git push 到远端
├── raw/    # 不可变的会话日志归档
├── db/     # memory.sqlite（FTS5 + 实体 + page_embeddings）
├── logs/   # 按日滚动的 tracing
└── models/ # 预留给未来的本地嵌入器
```

时间点一致性快照：

```bash
ssh "$SERVER" "docker exec ai-memory /usr/local/bin/ai-memory backup --to /data/snapshot-$(date +%F).tar.gz"
scp "$SERVER:$DEPLOY_DIR/data/snapshot-$(date +%F).tar.gz" ./backups/
```

`ai-memory backup` 命令用 SQLite 的在线备份 API，快照期间的写入保持一致。

## 回滚

```bash
ssh "$SERVER" "cd $DEPLOY_DIR && \
               docker tag $IMAGE $IMAGE-rollback && \
               docker pull $IMAGE@sha256:<old-digest>"
ssh "$SERVER" "cd $DEPLOY_DIR && docker compose up -d"
```

最简单的回滚是按 digest 拉回旧镜像。我们不提供 `bin/rollback`，因为正确做法是每次部署前留着上一个镜像 tag（Docker Hub 按 digest 免费保留每次推送）。

## 看日志

```bash
ssh "$SERVER" "docker logs -f --tail 100 ai-memory"
```

或在宿主上浏览按日滚动的日志：

```bash
ssh "$SERVER" "ls -la $DEPLOY_DIR/data/logs/"
ssh "$SERVER" "tail -100 $DEPLOY_DIR/data/logs/ai-memory.log.$(date +%F)"
```

## 故障排查

- **`curl http://<host>:49374/mcp` 得到 `Connection refused`**：容器没起来，或端口映射绑在了 `127.0.0.1` 而非 `0.0.0.0`。在家庭实验室上查 `docker ps`。
- **`unhealthy` 状态**：容器在跑但内嵌的 `ai-memory status` 健康检查失败。最可能是数据目录权限与容器用户（uid 1000）不匹配。在宿主上 `sudo chown -R 1000:1000 $DEPLOY_DIR/data` 修复。
- **换模型后的嵌入不匹配**：存储的 `(provider, model, dim)` 三元组与配置不同时，启动会记警告。混合检索忽略过期行直到重新嵌入。正常启动服务器，然后跑 `ai-memory embed --force` 重建 workspace 里每个项目，或加 `--project <name>` 限定重建范围。启用后，计划内嵌入回填也能补缺失行。
- **提供方失败**：`ai-memory status` 从最近一次真实提供方调用报告被动 LLM 与嵌入健康度。新进程在服务器真正用到该角色前报告 `unknown`；它不为健康报告探测提供方或花费 token。
- **容器重启循环**：查 `docker logs ai-memory`——顶部 `ai-memory starting` 行报告解析后的配置；缺少必需环境变量（如选了 `openai-compat` 却没设模型）会在这里带清晰报错失败。
