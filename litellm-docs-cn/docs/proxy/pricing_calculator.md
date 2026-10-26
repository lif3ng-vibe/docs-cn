# 定价计算器（成本估算）

根据预期的 Token 用量和请求量估算 LLM 成本。这款工具帮助开发者和平台团队在将模型部署到生产环境之前，提前预估支出。

## 何时使用此功能

定价计算器适用于以下场景：

- **预算规划**：在确定选用某个模型之前，先预估每月成本
- **模型对比**：针对你的使用场景，比较不同模型的成本
- **容量规划**：了解请求量扩大后对成本的影响
- **成本优化**：为你的 Token 需求找出性价比最高的模型

## 使用定价计算器

这段演练会带你走一遍在 LiteLLM UI 中使用定价计算器估算 LLM 成本的完整流程。

### 第 1 步：进入设置

在 LiteLLM 仪表板（dashboard）中，点击左侧边栏的 **Settings**（设置）。

![点击 Settings](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/183c437e-bda9-48b4-ab8f-95f023ba1146/ascreenshot_a1013487f545484194a9a4929eef4c49_text_export.jpeg)

### 第 2 步：打开成本追踪

点击 **Cost Tracking**（成本追踪），进入成本配置选项。

![点击 Cost Tracking](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/05c92350-cbae-42ed-935b-e96a26003de8/ascreenshot_cc85f175a6664fc5be8dfdcc1759b442_text_export.jpeg)

### 第 3 步：打开定价计算器

点击 **Pricing Calculator**（定价计算器），展开计算器面板。在这里可以根据预期的 Token 用量和请求量估算 LLM 成本。

![点击 Pricing Calculator](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/31ab5547-fa7d-4abd-b41a-7b4bbc0401f7/ascreenshot_f7f8b098ceba4b5199e5cbc60dddfd0a_text_export.jpeg)

### 第 4 步：选择模型

点击 **Model**（模型）下拉框，选择要估算成本的模型。

![点击 Model 字段](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/a6c236ce-3154-42a8-9701-120e3f7a017b/ascreenshot_635c61b832594e809f8ab79b5b3f32e1_text_export.jpeg)

从列表中选择一个模型。列表中显示的是 LiteLLM 代理服务器（proxy）上已配置的模型。

![选择模型](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/96c4ebc4-1b88-4dea-b3b2-ea32fde36d9e/ascreenshot_7c2920f05a984ebbb530a8a85e669537_text_export.jpeg)

### 第 5 步：配置 Token 数量

输入预期的 **Input Tokens (per request)**（每次请求的输入 Token 数），也就是你的提示词（prompt）平均包含的 Token 数。

![点击 Input Tokens 字段](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/d0b5ad8a-56e4-4f73-ac66-e1d728c81dc5/ascreenshot_42502082d6204a3891e0a2c3e89a1e38_text_export.jpeg)

再输入预期的 **Output Tokens (per request)**（每次请求的输出 Token 数），也就是模型响应平均包含的 Token 数。

![点击 Output Tokens 字段](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/d7481177-c63c-47f5-9316-1e87695f67f9/ascreenshot_8718cac4c0d14a82ab9f2b71795250c2_text_export.jpeg)

### 第 6 步：设置请求量

输入你预期的请求量，可以填写 **Requests per Day**（每日请求数）和/或 **Requests per Month**（每月请求数）。

![点击 Requests per Month 字段](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/42270e11-93f1-41dc-b9c7-3bb6971ced31/ascreenshot_79f2ea9937b34e48ab1ff832ce7f7cb7_text_export.jpeg)

例如，输入 `10000000` 表示每月 1000 万次请求。

![输入请求量](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/5e6c4338-ff87-44dd-9059-7577217fa3c8/ascreenshot_15c36610dc914536ac9446470eb39f05_text_export.jpeg)

### 第 7 步：查看成本估算

计算器会随着你修改数值自动更新。展示的成本明细包括：

- **单次请求成本**：每次请求的总成本、输入成本、输出成本，以及加成/费用
- **每日成本**：填写每日请求数后汇总出的每日成本
- **每月成本**：填写每月请求数后汇总出的每月成本

![查看成本估算](https://colony-recorder.s3.amazonaws.com/files/2026-01-05/4436cd11-df58-47cb-9742-c0d08865a61c/ascreenshot_f961298a4231464ea841bc4d184f731e_text_export.jpeg)

### 第 8 步：导出报告

点击 **Export**（导出）按钮，下载你的成本估算结果。支持两种导出格式：

- **PDF**：打开打印对话框，可另存为 PDF（适合分享给利益相关方）
- **CSV**：下载表格兼容的文件，便于进一步分析

## 成本明细说明

定价计算器会显示以下字段：

| 字段 | 说明 |
|-------|-------------|
| **总成本**（Total Cost） | 包含所有已配置加成的完整成本 |
| **输入成本**（Input Cost） | 输入（提示词）Token 的成本 |
| **输出成本**（Output Cost） | 输出（补全）Token 的成本 |
| **加成/费用**（Margin/Fee） | 已配置的[提供商加成](/docs/proxy/provider_margins) |
| **单 Token 价格**（Token Pricing） | 每 Token 单价（以 $/1M tokens 为单位显示） |

## API 端点

也可以通过 `/cost/estimate` 端点以编程方式估算成本：

```bash
curl -X POST "http://localhost:4000/cost/estimate" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "input_tokens": 1000,
    "output_tokens": 500,
    "num_requests_per_day": 1000,
    "num_requests_per_month": 30000
  }'
```

**响应**：

```json
{
  "model": "{{openai_large}}",
  "input_tokens": 1000,
  "output_tokens": 500,
  "num_requests_per_day": 1000,
  "num_requests_per_month": 30000,
  "cost_per_request": 0.008,
  "input_cost_per_request": 0.002,
  "output_cost_per_request": 0.006,
  "margin_cost_per_request": 0.0,
  "daily_cost": 8.0,
  "daily_input_cost": 2.0,
  "daily_output_cost": 6.0,
  "daily_margin_cost": 0.0,
  "monthly_cost": 240.0,
  "monthly_input_cost": 60.0,
  "monthly_output_cost": 180.0,
  "monthly_margin_cost": 0.0,
  "input_cost_per_token": 2e-06,
  "output_cost_per_token": 1.2e-05,
  "provider": "openai"
}
```

## 相关功能

- [提供商加成](/docs/proxy/provider_margins)：为 LLM 成本添加费用或加成
- [提供商折扣](/docs/proxy/provider_discounts)：在提供商成本基础上应用折扣
- [成本追踪](/docs/proxy/cost_tracking)：追踪并监控 LLM 花费
