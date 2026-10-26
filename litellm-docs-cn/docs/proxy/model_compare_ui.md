import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 模型对比 Playground 界面

在交互式 Playground 界面中并排对比多个 LLM 模型，评估各模型的响应、性能指标和成本，从而判断哪些模型最适合你的使用场景。

该功能 **在 v1.80.0-stable 及以上版本可用**。

## 概览

模型对比 Playground 界面支持同时并排对比最多 3 个不同的 LLM 模型。你可以配置模型、参数和测试提示词，并借助延迟、Token 用量、成本等详细指标来评估和比较各模型的响应。

<Image img={require('../../img/ui_model_compare_overview.png')} />

## 入门

### 访问模型对比界面

#### 1. 进入 Playground

前往 Admin UI（管理界面）中的 Playground 页面（`PROXY_BASE_URL/ui/?login=success&page=llm-playground`）。

<Image img={require('../../img/ui_playground_navigation.png')} />

#### 2. 切换到 Compare 标签页

点击 Playground 界面中的 **Compare** 标签。

## 配置

### 设置模型

#### 1. 选择要对比的模型

最多可同时对比 3 个模型。在每个对比面板中：

- 点击模型下拉框，查看可用模型
- 从已配置的端点中选择一个模型
- 模型列表会从你的 LiteLLM 代理配置中加载

<Image img={require('../../img/ui_model_compare_select_model.png')} />

#### 2. 配置模型参数

每个模型面板都支持独立配置参数：

**基础参数**：

- **Temperature**：控制随机性（0.0 到 2.0）
- **Max Tokens**：响应中允许的最大 Token 数

**高级参数**：

- 开启 "Use Advanced Params" 后，可配置更多模型专属参数
- 支持所选模型/提供商可用的全部参数

<Image img={require('../../img/ui_model_compare_model_parameters.png')} />

#### 3. 跨模型应用参数

打开 "Sync Settings Across Models" 开关，即可在所有对比面板之间同步参数（标签、防护栏、Temperature、Max Tokens 等），确保测试条件一致。

<Image img={require('../../img/ui_model_compare_sync_across_models.png')} />

### 防护栏

直接在 Playground 中配置并测试防护栏（guardrails）：

1. 点击模型面板中的防护栏选择器
2. 从已配置的防护栏列表中选择一个或多个
3. 测试不同模型在防护栏过滤下的响应
4. 对比各模型的防护栏行为

<Image img={require('../../img/ui_model_compare_guardrails_config.png')} />

### 标签

为对比添加标签，便于组织和筛选：

1. 从标签下拉框中选择标签
2. 标签有助于归类和追踪不同的测试场景

<Image img={require('../../img/ui_model_compare_tags_config.png')} />

### 向量存储

为 RAG（Retrieval Augmented Generation，检索增强生成）对比配置向量存储（vector store）检索：

1. 从下拉框中选择向量存储
2. 对比不同模型如何使用检索到的上下文
3. 评估各模型的 RAG 表现

<Image img={require('../../img/ui_model_compare_vector_stores_config.png')} />

## 运行对比

### 1. 输入提示词

在消息输入区输入你的测试提示词（prompt）。你可以：

- 为所有模型输入同一条消息
- 使用建议提示词快速测试
- 构建多轮对话

<Image img={require('../../img/ui_model_compare_enter_prompt.png')} />

### 2. 发送请求

点击发送按钮（或按 Enter 键）开始对比。所有选中的模型会同时处理该请求。

### 3. 查看响应

各模型面板会并排显示响应结果，方便你对比：

- 响应的质量与内容
- 响应的长度与结构
- 模型特有的格式风格

<Image img={require('../../img/ui_model_compare_responses.png')} />

## 对比指标

每个对比面板都会展示详细指标，帮助你评估模型表现：

### 首 Token 延迟（TTFT）

衡量从提交请求到收到首个 Token 之间的延迟。数值越低，说明模型给出初始响应越快。

### Token 用量

- **输入 Token**：提示词/请求中的 Token 数量
- **输出 Token**：模型响应中的 Token 数量
- **推理 Token**：用于推理的 Token（如适用，例如 o1 模型）

### 总延迟

从发出请求到收到最终响应的完整耗时，包括流式传输时间。

### 成本

如果你的 LiteLLM 配置中启用了成本追踪（cost tracking），你将看到：

- 每次请求的成本
- 按输入/输出 Token 细分的成本明细
- 各模型之间的成本对比

<Image img={require('../../img/ui_model_compare_cost_metrics.png')} />

## 使用场景

### 模型选型

用同一个提示词对比多个模型，判断哪个在你的具体场景中表现最佳：

- 响应质量
- 响应时间
- 成本效益
- Token 用量

### 参数调优

在各模型上测试不同的参数配置，找到最优设置：

- 不同的 Temperature 取值
- Max Tokens 上限
- 高级参数组合

### 防护栏测试

评估不同模型对安全过滤器和防护栏的响应：

- 过滤效果
- 误报率
- 模型特有的防护栏行为

### A/B 测试

借助标签和多次对比运行结构化的 A/B 测试：

- 对比模型的不同版本
- 测试提示词的不同变体
- 评估功能发布效果

---

## 相关功能

- [Playground Chat UI](./ui.md) - 单模型测试界面
- [Chat UI](./ui/chat_ui.md) - 聊天页面，支持聊天历史、MCP 工具，以及使用你自己的密钥、日志和用量数据
- [Model Management](./model_management.md) - 配置和管理模型
- [Guardrails](./guardrails/quick_start.md) - 设置安全过滤器
- [AI Hub](./ai_hub.md) - 与组织内成员共享模型和智能体
