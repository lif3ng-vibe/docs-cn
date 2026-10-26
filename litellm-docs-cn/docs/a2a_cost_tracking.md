import Image from '@theme/IdealImage';

# A2A Agent 成本追踪

LiteLLM 支持为 A2A Agent（Agent-to-Agent）添加自定义成本追踪（cost tracking），可配置：

- **每次查询固定成本**：对 Agent 的每次请求收取固定费用
- **按输入/输出 Token 计费**：费用随 Token 用量变化

这样就能在整个组织内追踪并归集 Agent 使用的成本，轻松了解每个团队或项目在 Agent 调用上的花费。

## 快速上手

### 1. 进入 Agents 页面

在侧边栏点击 “Agents”，打开 Agent 管理页面。

![进入 Agents](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/f9ac0752-6936-4dda-b7ed-f536fefcc79a/ascreenshot.jpeg?tl_px=208,326&br_px=2409,1557&force_format=jpeg&q=100&width=1120.0)

### 2. 新建 Agent

点击 “+ Add New Agent” 打开创建表单，需要填写几项基本信息：

- **Agent Name**：Agent 的唯一标识（API 调用时会用到）
- **Display Name**：界面上显示的易读名称

![输入 Agent Name](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/f5bacfeb-67a0-4644-a400-b3d50b6b9ce5/ascreenshot.jpeg?tl_px=0,0&br_px=2617,1463&force_format=jpeg&q=100&width=1120.0)

![输入 Display Name](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/6db6422b-fe85-4a8b-aa5c-39319f0d4621/ascreenshot.jpeg?tl_px=0,27&br_px=2617,1490&force_format=jpeg&q=100&width=1120.0)

### 3. 配置成本参数

向下滚动，点击 “Cost Configuration” 展开成本设置面板，在这里定义 Agent 使用的计费方式。

![点击 Cost Configuration](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/a3019ae8-629c-431b-b2d8-2743cc517be7/ascreenshot.jpeg?tl_px=0,653&br_px=2201,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=388,416)

### 4. 设置每次查询成本

输入每次查询的费用金额（单位为美元）。例如输入 `0.05`，表示对该 Agent 的每次请求收费 0.05 美元。

![设置每次查询成本](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/91159f8a-1f66-4555-a166-600e4bdecc68/ascreenshot.jpeg?tl_px=0,653&br_px=2201,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=372,281)

![输入费用金额](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2add2f69-fd72-462e-9335-1e228c7150da/ascreenshot.jpeg?tl_px=0,420&br_px=2617,1884&force_format=jpeg&q=100&width=1120.0)

### 5. 创建 Agent

全部配置完成后，点击 “Create Agent” 保存。Agent 即可投入使用，成本追踪也随之生效。

![创建 Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/1876cf29-b8a7-4662-b944-2b86a8b7cd2e/ascreenshot.jpeg?tl_px=416,653&br_px=2618,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=706,523)

## 测试成本追踪

接下来通过 Playground 发送一条测试请求，验证成本追踪是否正常工作。

### 1. 打开 Playground

在侧边栏点击 “Playground”，打开交互式测试界面。

![打开 Playground](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/7d5d8338-6393-49a5-b255-86aef5bf5dfa/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=41,98)

### 2. 选择 A2A 端点

Playground 默认使用对话补全（chat completions）端点。要测试你的 Agent，点击 “Endpoint Type”，在下拉框中选择 `/v1/a2a/message/send`。

![选择 Endpoint Type](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/4d066510-0878-4e0b-8abf-0b074fe2a560/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=325,238)

![选择 A2A 端点](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/fe2f8957-4e8a-4331-b177-d5093480cf60/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=333,261)

### 3. 选择你的 Agent

在 Agent 下拉框中选中刚创建的 Agent，它会以 Display Name 出现在列表中。

![选择 Agent](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/8c7add70-fe72-48cb-ba33-9f53b989fcad/ascreenshot.jpeg?tl_px=0,150&br_px=2201,1381&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=287,277)

### 4. 发送测试消息

输入一条消息并发送，可以用建议的提示词，也可以自己写。

![发送消息](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2c16acb1-4016-447e-88e9-c4522e408ea2/ascreenshot.jpeg?tl_px=15,653&br_px=2216,1883&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,443)

Agent 响应后，这条请求就会连同你配置的成本一起记录下来。

![Agent 响应](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/2dcf7109-0be4-4d03-8333-ef45759c70c9/ascreenshot.jpeg?tl_px=0,0&br_px=2201,1230&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=494,273)

## 在日志中查看成本

接下来确认成本确实已被追踪。

### 1. 进入日志页面

在侧边栏点击 “Logs”，查看所有最近的请求。

![打开 Logs](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/c96abf3c-f06a-4401-ada6-04b6e8040453/ascreenshot.jpeg?tl_px=0,118&br_px=2201,1349&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=41,277)

### 2. 查看成本归属

在列表中找到你的 Agent 请求，成本列会显示你配置的金额。这笔成本会归到发起请求的 API 密钥（API key）名下，按团队或项目追踪花费就很方便。

![在日志中查看成本](https://ajeuwbhvhr.cloudimg.io/https://colony-recorder.s3.amazonaws.com/files/2025-12-13/1ae167ec-1a43-48a3-9251-43d4cb3e57f5/ascreenshot.jpeg?tl_px=335,11&br_px=2536,1242&force_format=jpeg&q=100&width=1120.0&wat=1&wat_opacity=0.7&wat_gravity=northwest&wat_url=https://colony-recorder.s3.us-west-1.amazonaws.com/images/watermarks/FB923C_standard.png&wat_pad=524,277)

## 在用量页面查看花费

前往管理界面（Admin UI）的 Agent Usage 标签页，查看 Agent 级别的花费分析：

### 1. 打开 Agent Usage

进入 Admin UI 的 Usage 页面（`PROXY_BASE_URL/ui/?login=success&page=new_usage`），点击 **Agent Usage** 标签页。

<Image img={require('../img/agent_usage_ui_navigation.png')} />

### 2. 查看 Agent 分析

Agent Usage 仪表板提供以下内容：

- **每个 Agent 的总花费**：查看所有 Agent 的累计花费
- **每日花费趋势**：了解 Agent 花费随时间的变化
- **模型用量明细**：掌握每个 Agent 使用了哪些模型
- **活动指标**：追踪每个 Agent 的请求数、Token 数和成功率

<Image img={require('../img/agent_usage_analytics.png')} />

### 3. 按 Agent 筛选

使用 Agent 筛选下拉框，查看特定 Agent 的花费：

- 在下拉框中选择一个或多个 Agent ID
- 查看筛选后的分析数据、花费日志和活动指标
- 对比不同 Agent 之间的花费

<Image img={require('../img/agent_usage_filter.png')} />

## 成本配置选项

这些选项可以按你的计费模式自由组合：

| 字段 | 说明 |
| --- | --- |
| **Cost Per Query ($)** | 每次 Agent 请求收取的固定费用 |
| **Input Cost Per Token ($)** | 每处理一个输入 Token 的费用 |
| **Output Cost Per Token ($)** | 每生成一个输出 Token 的费用 |

对大多数场景来说，每次查询固定成本最简单。如果 Agent 的成本会随输入/输出长度明显波动，就改用按 Token 计价。

## 相关文档

- [A2A Agent 网关](./a2a.md)
- [花费追踪](./proxy/cost_tracking.md)
