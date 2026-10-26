import Image from '@theme/IdealImage';

# Azure PTU 固定成本归属

Azure 预置吞吐量（provisioned throughput）按预留容量以小时计费，而非按 Token 计费。团队拥有自己的 PTU 部署后，无论发出一个请求还是一百万个请求，付出的都是同样的时价，因此 LiteLLM 的按 Token 成本追踪结果与账单完全对不上。PTU 固定成本归属解决的正是这种错位：你告诉 LiteLLM 一份部署预留了多少容量、每小时成本是多少，每日任务就会把这笔成本归属到所属团队名下。

PTU 部署只按预留容量计费。LiteLLM 在其上保存的按 Token 价格为零，因此容量承载的流量不会在固定成本之外再被收一次费。

## 启用功能

该功能默认关闭，在你主动开启之前不会生效：

```bash
export LITELLM_ENABLE_PTU_COST_ATTRIBUTION=True
```

未设置该变量时，每日任务不会被调度，模型端点会拒绝 PTU 配置，用量读取路径报告的固定成本为零，模型表单中的 PTU 输入项也保持隐藏。

## 配置部署

PTU 配置存放在部署的 `model_info` 上。在管理界面（Admin UI）中打开 Models + Endpoints，选中该部署并编辑其设置。PTU 输入项就位于按 Token 价格下方，LiteLLM 会替你把这些价格保持为零：

<Image img={require('../../img/ptu_configure_model.png')} />

通过 `POST /model/new` 也能完成同样的配置：

```bash
curl -X POST http://localhost:4000/model/new \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model_name": "gpt-4o-ptu",
    "litellm_params": {
      "model": "azure/<your-deployment-name>",
      "api_key": "os.environ/AZURE_API_KEY",
      "api_base": "os.environ/AZURE_API_BASE"
    },
    "model_info": {
      "team_id": "<the owning team id>",
      "ptu_count": 100,
      "cost_per_ptu_per_hour": 0.02,
      "ptu_effective_from": "2026-01-01T00:00:00Z"
    }
  }'
```

或者在 `config.yaml` 中：

```yaml
model_list:
  - model_name: gpt-4o-ptu
    litellm_params:
      model: azure/<your-deployment-name>
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
    model_info:
      id: gpt-4o-ptu-team-a
      team_id: <the owning team id>
      ptu_count: 100
      cost_per_ptu_per_hour: 0.02
      ptu_effective_from: "2026-01-01T00:00:00Z"
```

以这种方式声明的部署必须提供 `model_info.id`，否则代理服务器会拒绝加载，并在启动日志中点名该部署。若不手动指定，id 会从模型名和解析后的 `litellm_params` 推导得出，因此轮换凭证就会生成一个新身份，预留容量会在新身份下被再计一次费，而且事后没有任何机制冲正。任何稳定的字符串都可以，但必须在你所有部署之间唯一。

如果要升级一笔已经产生费用的现有预留，请把 `id` 设为它当前使用的 id，而不是另起新名，否则已入账的费用仍挂在旧身份下，新身份会另起炉灶从头计费。启动报错信息中会引用该现有 id，方便你直接复制。

`team_id` 决定容量费用归属给谁，缺少它的声明不会累计任何费用。

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| `id` | in `config.yaml` | 部署的稳定身份。通过 API 或 UI 配置时不需要，系统会替你存好一个 |
| `team_id` | yes | 容量所属的团队。一份部署对应一个团队 |
| `ptu_count` | yes | 预留的预置吞吐单位数 |
| `cost_per_ptu_per_hour` | yes | 你合同约定的每单位每小时价格 |
| `ptu_effective_from` | yes | 预留开始计费的时点 |
| `ptu_effective_to` | no | 计费截止时点。不填表示开放式预留 |

`ptu_count` 和 `cost_per_ptu_per_hour` 必须成对设置，`ptu_effective_from` 也必填，因为固定成本从那一刻起开始累计。缺了它，今天才配置的部署会为它尚不存在的日子计费。

`cost_per_ptu_per_hour` 请取自你的 Azure 合同而非公开标价；PTU 价格是协商出来的，随地区和承诺期限而不同。

## 成本如何计算

每日 00:15 UTC 会运行一个任务，按团队和模型为前一天各写入一行记录：

```
flat cost = ptu_count x cost_per_ptu_per_hour x hours active that day
```

活跃小时数是当天与预留窗口的重叠部分，因此中午开始的预留第一天累计 12 小时，之后每天 24 小时。这些记录写入 `LiteLLM_DailyTeamSpend` 表，使用保留键 `__ptu_flat_cost__`，从而把固定成本与记录在真实 API 密钥名下的按请求花费分开存放。

开始时间早于任务首次看到它的预留同样会被补记：补算环节会把 `ptu_effective_from` 以来每一天的价格都补上，最多回溯 91 天。因此，今天才配置但起始日期提前的部署，会在第一次运行时把整个窗口的费用都补齐。

固定成本不计入团队或密钥预算。预留容量本来就已付费，团队不可能通过使用自己预留的容量把预算耗尽。

## 溢出请求

当 PTU 部署满载时，Azure 可以把溢出流量转到你配置的按量付费部署（即溢出目标），并按 Token 对这些请求计费。LiteLLM 同样如此：带 `x-ms-is-spilled-over: true` 的响应按所服务模型的标准价格计价，而 PTU 自己服务的请求保持为零。无论哪种情况，每小时的固定成本都不变。

溢出请求会在花费日志的元数据中打上标记，便于你在 Logs 页面上区分：

```json
"azure_spillover": {"from_deployment": "<your-deployment-name>"}
```

这需要已设置 `LITELLM_ENABLE_PTU_COST_ATTRIBUTION`，并且价格映射中存在所服务模型的条目（部署名称对不上时请设置 `base_model`）。两者缺其一时，溢出请求仍按零记录。

## 读取成本

`/team/daily/activity` 会报告每天的 `flat_cost` 和区间内的 `total_flat_cost`，与常规的按 Token `spend` 并列：

```bash
curl -s "http://localhost:4000/team/daily/activity?team_ids=<team-id>&start_date=2026-01-01&end_date=2026-01-31" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" | jq '{
    total_spend: .metadata.total_spend,
    total_flat_cost: .metadata.total_flat_cost
  }'
```

管理界面中的 Usage 页面在 Team Usage 下方展示同样的数字，把固定成本与请求成本分开绘图，CSV 导出也包含这两项：

<Image img={require('../../img/ptu_usage_flat_cost.png')} />

## 不可设置的价格

LiteLLM 会拒绝在 PTU 部署上设置按 Token、按秒或缓存价格，并点名被拒绝的字段。传 `0`、全零的价格表或不传值都会被接受：

```
A PTU deployment bills by reserved capacity, so input_cost_per_token cannot be charged on top
of it. Send 0 or no value, or remove ptu_count and cost_per_ptu_per_hour to bill per token.
```

添加 PTU 配置时，部署上已存储的价格会被清零而不是被拒绝，因此在功能启用前就定过价的部署会在下一次保存时自动修正。移除 `ptu_count` 和 `cost_per_ptu_per_hour` 会解除这些零值，部署恢复按 Token 计费。

网络搜索价格按同样方式处理。注意 xAI 模型的每次搜索调用无论如何都会按标价计费，因为其价格读取逻辑会忽略零价格。

## 局限性

旧版 `POST /model/update` 不会执行上述规则，因此通过它配置的 PTU 部署会继续按 Token 计费，永远不会累计固定成本。请改用 `POST /model/new`、`PATCH /model/{model_id}/update`、管理界面或 `config.yaml`。

单独使用的 Python `Router` 会在注册时把按 Token 价格清零，但代理之外没有任何机制调度每日任务，因此固定成本不会在那里累计。
