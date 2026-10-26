# LLM 成本的费用与价格加成（Fee/Price Margin）

可以为特定提供商（provider）或全局范围，按百分比或固定金额添加加价（margin）。对于需要把运营开销计入成本、向内部使用方收费的企业来说，这个功能非常实用。

## 适用场景

如果你的生成式 AI 平台涉及各类运营与架构开销，以及基础设施成本，可能就需要具备一项能力：对 LLM 总成本额外收取一笔费用或加价。

**常见使用场景**：
- **内部成本分摊** - 向内部团队计费时，把运营开销成本计入其中
- **成本回收** - 收回基础设施、支持与平台维护成本

## 通过 UI 配置加价

本节演示如何在 LiteLLM UI 中添加提供商加价，并查看成本明细（cost breakdown）。

### 第 1 步：进入 Settings

在 LiteLLM 仪表板（dashboard）中，点击左侧边栏的 **Settings**。

![点击 Settings](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/a9a42382-1c93-4338-8c7e-c0ebc4ee239f/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=47,292)

### 第 2 步：打开成本追踪（Cost Tracking）

点击 **Cost Tracking**，进入成本配置选项。

![点击 Cost Tracking](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/c3ad52c0-1c8d-4be5-bd04-1e37ce186c8e/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=65,403)

### 第 3 步：选择 Fee/Price Margin

点击 **Fee/Price Margin**。在这里可以为 LLM 成本添加费用或加价，用于内部计费和成本回收。

![点击 Fee/Price Margin](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/0810c7bf-e927-4ab6-a55d-37c51d8c17af/ascreenshot.jpeg?tl_px=553,0&br_px=2618,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=551,220)

### 第 4 步：新增提供商加价

点击 **+ Add Provider Margin**，新建一条加价配置。

![点击 Add Provider Margin](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/8762b7d9-74e5-45eb-acc3-be0d9c5b799d/ascreenshot.jpeg?tl_px=553,2&br_px=2618,1155&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=929,277)

### 第 5 步：选择提供商

点击搜索框，选择要应用加价的提供商。

![点击搜索框](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/7ff01cdc-2749-43f3-a46f-4fd5543446e3/ascreenshot.jpeg?tl_px=507,0&br_px=2572,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,177)

你可以选择 **Global (All Providers)**，把加价应用到所有提供商；也可以选择某个具体的提供商，比如 Bedrock、OpenAI 或 Anthropic。

![选择 Global](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/c9efe187-0995-45ae-9366-290cb20835a2/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=485,182)

本例中我们选择 **Bedrock** 作为提供商。

![选择 Bedrock](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/ea1524ed-7217-4ee6-9beb-797e3ff08b3a/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1462&force_format=jpeg&q=100&width=1120.0)

### 第 6 步：选择加价类型

选择加价类型：可以选 **Percentage-based**（按百分比，例如加价 10%），也可以选 **Fixed Amount**（固定金额，例如每次请求 $0.001）。

![点击 Percentage-based](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/137ffea5-0a5e-445a-809f-a85d20701c87/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=355,259)

本例中我们选择 **Fixed Amount**，为每次请求添加一笔固定费用。

![点击 Fixed Amount](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/56828562-2bae-4f69-b68e-13b1b6a03aa6/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=493,252)

### 第 7 步：填写加价数值

填写加价数值。本例中我们为每次请求添加 $25 的固定费用。

![填写加价数值](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/80018d4b-0205-43a3-a534-9a0e39ddf139/ascreenshot.jpeg?tl_px=0,0&br_px=2618,1462&force_format=jpeg&q=100&width=1120.0)

### 第 8 步：保存加价配置

点击 **Add Provider Margin** 保存配置。

![点击 Add Provider Margin](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/84a5bcb8-f475-4aef-83ec-f0b3b620613f/ascreenshot.jpeg?tl_px=553,206&br_px=2618,1359&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=636,276)

### 第 9 步：在 Playground 中测试加价

进入 **Playground**，通过发起一次请求来验证加价配置。

![点击 Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/cda7293a-2439-4301-bc44-211e6d6833a6/ascreenshot.jpeg?tl_px=0,0&br_px=2064,1153&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=37,106)

选择一个模型，发送一条测试消息。

![发送测试消息](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/48c3e28e-a01a-483c-838d-2d1643f44be7/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1462&force_format=jpeg&q=100&width=1120.0)

在消息输入框中填写提示词（prompt）并提交。

![填写提示词](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/88963dbe-6bad-4aac-8bd3-7f4eac0dd995/ascreenshot.jpeg?tl_px=243,730&br_px=2308,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,451)

你会收到模型的响应。

![查看响应](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/1d69ef9c-cc22-40ad-8f10-f14a359d2fb6/ascreenshot.jpeg?tl_px=553,17&br_px=2618,1170&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=549,276)

### 第 10 步：在 Logs 中查看成本明细（Cost Breakdown）

进入 **Logs**，查看这次请求的详细成本明细。

![点击 Logs](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/5cf6dd8b-0783-41ee-b23a-32f3424c2092/ascreenshot.jpeg?tl_px=0,99&br_px=2064,1252&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=32,276)

点击展开图标，查看请求详情。

![点击展开图标](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/3ae2900f-1515-4bb9-a4aa-328b43f13b61/ascreenshot.jpeg?tl_px=0,12&br_px=2064,1165&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=187,277)

### 第 11 步：查看成本明细详情

点击 **Cost Breakdown**，查看总成本的计算过程，包括加价部分。

![点击 Cost Breakdown](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/8bce9050-58ca-4860-9e18-1b704e086cf4/ascreenshot.jpeg?tl_px=392,575&br_px=2457,1728&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,276)

成本明细中会展示所添加的加价金额。本例中可以清楚看到 **+$25.00** 的加价。

![查看加价金额](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/c4a65d38-a47a-4634-baf2-608447a7d711/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=388,282)

总成本等于基础 LLM 成本加上加价，成本结构一目了然。

![查看总成本](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-25/3b13550d-5255-4818-b3ee-3d4391991c13/ascreenshot.jpeg?tl_px=0,730&br_px=2064,1884&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=384,323)

## 通过配置文件设置加价

也可以直接在 `config.yaml` 文件中配置加价。

**第 1 步**：把加价配置写入 config.yaml

```yaml
# Apply margins to providers
litellm_settings:
  cost_margin_config:
    global: 0.05            # 5% global margin on all providers
    openai: 0.10            # 10% margin for OpenAI (overrides global)
    anthropic:
      fixed_amount: 0.001   # $0.001 fixed fee per request
```

**第 2 步**：启动代理服务器

```bash
litellm /path/to/config.yaml
```

对于已配置的提供商，所有成本计算都会自动应用加价。

## 加价的工作原理

- 加价在折扣（如已配置）**之后**应用
- 加价与折扣各自独立计算
- 支持以下写法：
  - **按百分比**：`{"openai": 0.10}` = 10% 加价
  - **固定金额**：`{"openai": {"fixed_amount": 0.001}}` = 每次请求 $0.001
  - **全局**：`{"global": 0.05}` = 所有提供商 5% 加价（除非该提供商配置了专属加价）
- 提供商专属加价会覆盖全局加价
- 加价信息会记录在成本明细日志中
- 加价信息也会通过响应头返回：
  - `x-litellm-response-cost-margin-amount` - 添加的加价总额（单位：美元）
  - `x-litellm-response-cost-margin-percent` - 应用的加价百分比

## 加价计算示例

**示例 1**：仅按百分比加价
```yaml
litellm_settings:
  cost_margin_config:
    openai: 0.10  # 10% margin
```
若基础成本为 $1.00，最终成本 = $1.00 x 1.10 = $1.10

**示例 2**：仅固定金额
```yaml
litellm_settings:
  cost_margin_config:
    anthropic:
      fixed_amount: 0.001  # $0.001 per request
```
若基础成本为 $1.00，最终成本 = $1.00 + $0.001 = $1.001

**示例 3**：全局加价，提供商覆盖
```yaml
litellm_settings:
  cost_margin_config:
    global: 0.05   # 5% global margin
    openai: 0.10   # 10% margin for OpenAI (overrides global)
```
- OpenAI 请求：应用 10% 加价
- 其他所有提供商：应用 5% 加价

## 加价与折扣叠加

加价与折扣相互独立计算：

1. 先计算基础成本
2. 应用折扣（如已配置）
3. 在折后成本上应用加价

**示例**：
```yaml
litellm_settings:
  cost_discount_config:
    openai: 0.05  # 5% discount
  cost_margin_config:
    openai: 0.10  # 10% margin
```

若基础成本为 $1.00：
- 应用折扣后：$1.00 x 0.95 = $0.95
- 应用加价后：$0.95 x 1.10 = $1.045

## 支持的提供商

可以为所有 LiteLLM 支持的提供商配置加价，也可以用 `global` 作用于全部提供商。常见示例：

- `global` - 作用于所有提供商（除非该提供商配置了专属加价）
- `openai` - OpenAI
- `anthropic` - Anthropic
- `vertex_ai` - Google Vertex AI
- `gemini` - Google Gemini
- `azure` - Azure OpenAI
- `bedrock` - AWS Bedrock

完整提供商列表见 [LlmProviders](https://github.com/BerriAI/litellm/blob/main/litellm/types/utils.py) 枚举定义。
