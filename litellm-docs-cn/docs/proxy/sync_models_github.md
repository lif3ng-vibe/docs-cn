# 自动同步新模型（Day-0 首发）

无需重启服务，即可让模型价格与上下文窗口（context window）数据保持最新。**这样新模型 Day-0 发布当天就能获得支持，全程无需重启服务**。

## 概述

当 OpenAI、Anthropic 等提供商（provider）发布新模型（例如 GPT-5、Claude 4）时，你通常需要重启 LiteLLM 服务，才能拿到最新的价格与上下文窗口数据。

启用自动同步（auto-sync）后，LiteLLM 会自动从 GitHub 上的 [`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) 拉取最新模型数据，全程无需重启。这意味着：

- **零停机**：新模型发布时服务不中断
- **价格始终准确**：让成本追踪（cost tracking）与预算（budget）始终有据可依
- **自动更新**：设置一次，之后无需再管

:::info[启动行为（无需任何配置）]
本页的这些端点只控制**代理运行期间的重新同步**。无论是否用到它们，每个 LiteLLM 进程在启动时就已经会**拉取一次**远程的 `model_prices_and_context_window.json`（来源为 GitHub `main`，若设置了 `LITELLM_MODEL_COST_MAP_URL` 则为该 URL），只有当这次拉取失败或未通过校验时，才回退到随包内置的副本（`litellm/model_prices_and_context_window_backup.json`）。如果你在自己的镜像中自带了价格文件副本，并希望代理优先使用它而不是远程文件，必须设置 `LITELLM_LOCAL_MODEL_COST_MAP=True`。详见 [自定义模型价格映射](./custom_model_cost_map)；要确认当前加载的是哪一份，可查看 `GET /model/cost_map/source`。
:::

<iframe width="840" height="500" src="https://www.loom.com/embed/ba41acc1882d41b284bbddbb0e9c27ce?sid=bdae351e-2026-4e39-932b-fcb185ff612c" frameBorder="0" allowFullScreen></iframe>

<br/>
<br/>

## 快速上手

**手动同步**：
```bash
curl -X POST "https://your-proxy-url/reload/model_cost_map" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**每 6 小时自动同步**：
```bash
curl -X POST "https://your-proxy-url/schedule/model_cost_map_reload?hours=6" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## API 端点

| 端点 | 方法 | 说明 |
|----------|--------|-------------|
| `/reload/model_cost_map` | POST | 手动同步 |
| `/schedule/model_cost_map_reload?hours={hours}` | POST | 设置周期性同步 |
| `/schedule/model_cost_map_reload` | DELETE | 取消已计划的同步 |
| `/schedule/model_cost_map_reload/status` | GET | 查询同步状态 |
| `/model/cost_map/source` | GET | 当前加载的映射来自哪里、对应哪个版本 |

**鉴权要求**：需要管理员角色或主密钥（master key）

如果重新加载成功，但新添加的模型仍然没有出现，请先按 [重新加载价格数据后模型缺失](../troubleshoot/missing_model) 一文排查，再对部署（deployment）做任何改动。

## 查看已加载的版本

代理每次加载价格映射（pricing map），都会记录下所解析内容的 git blob id，也就是在 litellm 代码检出中执行 `git rev-parse <commit>:model_prices_and_context_window.json` 时为该文件输出的那个 id。在 `GET /model/cost_map/source`、`POST /reload/model_cost_map` 和 `GET /schedule/model_cost_map_reload/status` 的返回中，这个 id 以 `source_revision` 字段呈现，并附带 GitHub 为此次拉取返回的 `etag` 以及 `loaded_at`。管理界面（Admin UI）中 Models and Endpoints 分区下的 Price Data Reload 卡片也会显示同样的三项值。

```bash
curl -s "https://your-proxy-url/model/cost_map/source" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

```json
{
  "source": "remote",
  "url": "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json",
  "is_env_forced": false,
  "fallback_reason": null,
  "loaded_at": "2026-09-08T00:49:21.311283+00:00",
  "source_revision": "b1ffc1583e46583bb4becd34cf85ec70c6930828",
  "etag": "W/\"6523ba12ad8daed03f7c879bc2c079d11b111d1ebdee2c27a34c0c756af30445\"",
  "model_count": 3850
}
```

`source_revision` 一句话就能回答"我的代理当前用的是哪份价格映射"。要与 `main` 比对，可在 litellm 代码检出中运行 `git rev-parse origin/main:model_prices_and_context_window.json`：两者一致，说明代理用的就是当前文件。想知道 `main` 是何时合入这份文件的，运行 `git log --first-parent --find-object=<source_revision> --format='%h %cs %s' origin/main -- model_prices_and_context_window.json`：较早的一行是引入该文件的那次合并；如果还有更新的一行，则是替换它的那次合并。`--first-parent` 很关键，因为大多数改动都是通过从 `litellm_internal_staging` 合并进入 `main` 的，普通的 `git log` 会漏掉这些合并记录。没有本地检出时，可以用 `gh api 'repos/BerriAI/litellm/contents/model_prices_and_context_window.json?ref=main' --jq .sha` 查看 `main` 当前提供的 id。两个代理若报告相同的 `source_revision`，它们提供的价格映射就逐字节一致，无论各自从哪个 URL 拉取。当映射来自内置副本时（设置了 `LITELLM_LOCAL_MODEL_COST_MAP=True`，或拉取失败），`etag` 为 `null`，此时 `source_revision` 就是内置文件的 id。JSON 文件本身不写入任何标记，因此文件里既没有 `_metadata` 条目，也没有 `generated_at`

## Python 示例

```python
import requests

def sync_models(proxy_url, admin_token):
    response = requests.post(
        f"{proxy_url}/reload/model_cost_map",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return response.json()

# Usage
result = sync_models("https://your-proxy-url", "your-admin-token")
print(result['message'])
```

## 配置

以下两个变量既作用于启动时的拉取，也作用于上述端点触发的每次重新加载。

**自定义模型价格映射 URL**（下方展示的是默认值；即使不设置该变量，远程拉取也照常进行）：
```bash
export LITELLM_MODEL_COST_MAP_URL="https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json"
```

**仅使用本地模型价格映射**（在启动和重新加载时都禁用远程拉取；使用随包内置的备份文件）：
```bash
export LITELLM_LOCAL_MODEL_COST_MAP=True
```
