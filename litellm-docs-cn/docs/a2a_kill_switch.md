import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Agent 终止开关（Kill Switch）

在每个 Agent 上保存一个"停止该 Agent"的 webhook，当 Agent 行为异常时由 LiteLLM 触发。

## 概述

终止开关（kill switch）是一个可选的出站 webhook，与 Agent 的其他配置存放在一起。它保存了 Agent 运行时执行停机调用所需的端点、HTTP 方法、请求头、查询参数、JSON 正文和认证信息。代理管理员（proxy admin）既可以用单个请求触发它，也可以在管理界面（Admin UI）中 Agent 页面的 Danger Zone 区域触发。LiteLLM 只负责发出 webhook 调用；Agent 在 LiteLLM 侧仍保持注册和启用状态，是否删除由你另行决定。每次触发都会写入审计日志。

只有代理管理员才能设置或触发终止开关。auth 块中的机密信息（bearer token、API 密钥、basic auth 密码）在每次读取时都会被遮蔽为 `REDACTED_BY_LITELM`。非管理员读取某个 Agent 时，看到的则是 `kill_switch: null`。

## 配置终止开关

<Tabs>
<TabItem value="ui" label="UI">

1. 在 LiteLLM 仪表板（dashboard）中进入 **Agents**。
2. 创建或编辑一个 Agent。
3. 打开 **Kill switch** 面板，填写 URL、方法、请求头、查询参数、JSON 正文和认证类型。
4. 保存。之后 Agent 详情页会显示已配置的端点和方法，凭证部分已脱敏。

<Image img={require('../img/a2a_kill_switch_form.png')} />

</TabItem>
<TabItem value="api" label="REST API">

```bash
curl -X POST http://localhost:4000/v1/agents \
  -H "Authorization: Bearer sk-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "inventory-agent",
    "agent_card_params": { ... },
    "kill_switch": {
      "url": "https://agents.internal.example.com/agents/inventory/kill?source=litellm",
      "method": "DELETE",
      "headers": {"X-Env": "prod"},
      "query_params": {"force": "1"},
      "body": {"agent": "inventory-agent", "reason": "manual stop"},
      "auth": {"type": "bearer", "token": "ops-secret-token"}
    }
  }'
```

同样的字段也适用于 `PATCH /v1/agents/{agent_id}` 和 `PUT /v1/agents/{agent_id}`。PATCH 时省略 `kill_switch` 会保留已存配置，而 `"kill_switch": null` 会将其移除。当你 PATCH 一个返回过脱敏 auth 的 Agent 时，把 `REDACTED_BY_LITELM` 作为 token 原样传回，已存的机密就会保持不变。

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml
agents:
  - agent_name: inventory-agent
    agent_card_params:
      name: "Inventory Agent"
      url: "http://localhost:10001"
      protocolVersion: "1.0"
    kill_switch:
      url: "https://agents.internal.example.com/agents/inventory/kill"
      method: POST
      headers:
        X-Env: prod
      body:
        agent: inventory-agent
      auth:
        type: basic
        username: ops
        password: os.environ/AGENT_KILL_SWITCH_PASSWORD
```

</TabItem>
</Tabs>

## 字段

| 字段 | 是否必填 | 说明 |
|---|---|---|
| `url` | yes | 绝对的 `http` 或 `https` URL。URL 自带的查询串会保留，并与 `query_params` 合并 |
| `method` | no | `POST`（默认）、`PUT`、`PATCH`、`DELETE` 或 `GET` |
| `headers` | no | 每次触发都会发送的静态请求头。与认证请求头同名时，以认证请求头为准 |
| `query_params` | no | 追加到 URL 上的查询参数 |
| `body` | no | 作为请求正文发送的 JSON 对象 |
| `auth` | no | 下方任意一种认证结构 |

`auth` 块按 `type` 区分类型。`{"type": "bearer", "token": "..."}` 会发送 `Authorization: Bearer <token>`；`{"type": "api_key", "header_name": "X-API-Key", "key": "..."}` 会把密钥放在你指定的请求头中发送；`{"type": "basic", "username": "...", "password": "..."}` 会发送 `Authorization: Basic` 请求头。如果端点无需认证，省略 `auth` 即可。

## 触发终止开关

<Tabs>
<TabItem value="ui" label="UI">

在 **Agents** 列表中打开该 Agent，滚动到页面底部的 **Danger Zone**。该区域仅对代理管理员渲染，并且会提示：触发后会停止 Agent 的上游运行时，可能造成服务中断。

<Image img={require('../img/a2a_kill_switch_danger_zone.png')} />

点击 **Fire Kill Switch**，输入 Agent 的完整名称以启用 **Fire** 按钮，然后确认。之后该区域会显示状态码，以及 webhook 返回的响应开头部分。

<Image img={require('../img/a2a_kill_switch_fired.png')} />

</TabItem>
<TabItem value="api" label="REST API">

```bash
curl -X POST http://localhost:4000/v1/agents/{agent_id}/kill_switch \
  -H "Authorization: Bearer sk-admin"
```

```json
{
  "agent_id": "41c54c9e-4327-47c0-8582-cbe848cc6131",
  "url": "https://agents.internal.example.com/agents/inventory/kill",
  "method": "DELETE",
  "status_code": 202,
  "response_body": "{\"stopped\": true}",
  "error": null
}
```

</TabItem>
</Tabs>

LiteLLM 会严格按配置内容发送请求，超时时间 10 秒，且不跟随重定向。webhook 返回 2xx 时，接口返回 `200`，附带接收方的状态码和其正文的前 2000 个字符。非 2xx 响应或传输失败则返回 `502`，结构相同，方便你查看接收方的返回内容。触发未配置终止开关的 Agent 返回 `400`，Agent 不存在返回 `404`，非管理员密钥在任何请求发出之前就会得到 `403`。

响应正文会展示给触发开关的管理员，因此请把 webhook 指向一个不会回显机密信息的端点。

## 审计日志

每次真正到达 webhook 的触发，无论返回是否为 2xx，都会以 Agent id 为对象，向 `LiteLLM_AgentsTable` 表写入一条 `kill_switch_fired` 审计记录。该记录包含触发者（用户和密钥）、目标 URL、方法、webhook 返回的状态码和截断后的正文，以及传输错误（如有）。终止开关的配置本身，包括 auth、自定义请求头、body 和查询参数，绝不会写入记录。审计日志需要设置 `litellm_settings.store_audit_logs: true`，参见[审计日志](./proxy/multiple_admins)。

在管理界面中打开 **Logs**，切换到 **Audit Logs** 标签页，把操作筛选为 **Kill switch fired**（或把表筛选为 **Agents**）。点击任意一行即可查看完整负载。

<Image img={require('../img/a2a_kill_switch_audit_log.png')} />
