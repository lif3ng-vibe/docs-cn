import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 客户用量

直接在仪表板中追踪并可视化终端用户的花费。通过监控客户级别的用量分析、花费日志与活跃度指标，了解客户如何使用你的 LLM 服务。

此功能 **在 v1.80.8-stable 及以上版本可用**。

## 概览

借助客户用量（Customer Usage）功能，你可以在 API 请求中传入一个 ID，从而追踪单个客户（终端用户）的花费与用量。这样你就能：

- 自动追踪每个客户的花费
- 在管理界面（Admin UI）中查看客户级别的用量分析
- 按客户 ID 筛选花费日志与活跃度指标
- 为每个客户设置预算与速率限制
- 监控客户的用量模式与趋势

<Image img={require('../../img/customer_usage.png')} />

## 如何追踪花费

在 API 请求中加入 `user` 字段，或传入客户 ID 请求头，即可追踪客户花费。客户 ID 会被自动追踪，并与该请求产生的所有花费关联起来。

<Tabs>
<TabItem value="body" label="请求体" default>

### 通过请求体

调用 `/chat/completions`，并在 `user` 字段中填入你的客户 ID：

```bash showLineNumbers title="Track spend with customer ID in body"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --data '{
    "model": "{{openai_small}}",
    "user": "customer-123",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ]
  }'
```

</TabItem>
<TabItem value="header" label="请求头">

### 通过请求头

也可以通过 HTTP 请求头传递客户 ID。对于支持自定义请求头但不允许修改请求体的工具（例如配合 `ANTHROPIC_CUSTOM_HEADERS` 使用的 Claude Code），这种方式尤其实用。

LiteLLM 会自动识别以下标准请求头（无需任何配置）：
- `x-litellm-customer-id`
- `x-litellm-end-user-id`

```bash showLineNumbers title="Track spend with customer ID in header"
curl -X POST 'http://0.0.0.0:4000/chat/completions' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'x-litellm-customer-id: customer-123' \
  --data '{
    "model": "{{openai_small}}",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ]
  }'
```

#### 配合 Claude Code 使用

Claude Code 支持通过环境变量 `ANTHROPIC_CUSTOM_HEADERS` 设置自定义请求头。将其配置如下即可传递客户 ID：

```bash title="Configure Claude Code with customer tracking"
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000/v1/messages"
export ANTHROPIC_API_KEY="sk-<your-api-key>"
export ANTHROPIC_CUSTOM_HEADERS="x-litellm-customer-id: my-customer-id"
```

此后 Claude Code 发出的所有请求都会自动把花费记到 `my-customer-id` 名下。

</TabItem>
</Tabs>

客户 ID 会随新增花费自动 upsert（存在则更新，不存在则插入）到数据库中。若客户 ID 已存在，则在其花费上累加。

### OpenWebUI 示例

有关将 Open WebUI 接入 LiteLLM 并追踪客户用量的详细步骤，请参阅 [Open WebUI 教程](../tutorials/openweb_ui.md)。

## 如何查看花费

### 在 Admin UI 中查看花费

前往管理界面中的 Customer Usage（客户用量）标签页，查看客户级别的花费分析：

#### 1. 访问客户用量

打开管理界面中的 Usage 页面（`PROXY_BASE_URL/ui/?login=success&page=new_usage`），然后点击 **Customer Usage** 标签页。

<Image img={require('../../img/customer_usage_ui_navigation.png')} />

#### 2. 查看客户分析

Customer Usage 仪表板提供以下内容：

- **每个客户的总花费**：查看所有客户的汇总花费
- **每日花费趋势**：了解客户花费随时间的变化
- **模型用量明细**：掌握每位客户使用了哪些模型
- **活跃度指标**：追踪每位客户的请求数、Token 数与成功率

<Image img={require('../../img/customer_usage_analytics.png')} />

#### 3. 按客户筛选

使用客户筛选下拉框查看特定客户的花费：

- 在下拉框中选择一个或多个客户 ID
- 查看筛选后的用量分析、花费日志与活跃度指标
- 对比不同客户之间的花费

<Image img={require('../../img/customer_usage_filter.png')} />

## 使用场景

### 客户计费

按客户追踪花费，准确向终端用户收费：

- 监控单个客户的用量
- 根据实际花费生成账单
- 为每个客户设置消费上限

### 用量分析

了解不同客户如何使用你的服务：

- 识别高价值客户
- 分析用量模式
- 优化资源分配

---

## 相关功能

- [客户 / 终端用户预算](./customers.md) - 为客户设置预算与速率限制
- [成本追踪](./cost_tracking.md) - 成本追踪与分析
- [计费](./billing.md) - 根据客户用量计费
