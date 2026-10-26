Guardrails - Quick Start | 防护栏（Guardrails）快速上手 | 防护栏guardrails快速上手
1. Define guardrails on your LiteLLM config.yaml | 1. 在 LiteLLM config.yaml 中定义防护栏 | 1-在-litellm-configyaml-中定义防护栏
Supported values for `mode` (Event Hooks) | `mode` 的可选值（事件钩子） | mode-的可选值事件钩子
Run on streaming or non-streaming requests only with `stream_scope` | 用 `stream_scope` 限定只在流式或非流式请求上运行 | 用-stream_scope-限定只在流式或非流式请求上运行
Validation | 校验 | 校验
Observe only one direction with `logging_only_scope` | 用 `logging_only_scope` 只观察单个方向 | 用-logging_only_scope-只观察单个方向
If the input scan fails | 输入扫描失败时 | 输入扫描失败时
Validation | 校验 | 校验-1
Skip system messages in guardrail evaluation | 在防护栏评估中跳过 system 消息 | 在防护栏评估中跳过-system-消息
Skip tool messages in guardrail evaluation | 在防护栏评估中跳过 tool 消息 | 在防护栏评估中跳过-tool-消息
Where the skip flags apply | 这些跳过开关的适用范围 | 这些跳过开关的适用范围
Load Balancing Guardrails | 防护栏负载均衡 | 防护栏负载均衡
2. Start LiteLLM Gateway | 2. 启动 LiteLLM 网关 | 2-启动-litellm-网关
3. Test request | 3. 测试请求 | 3-测试请求
**Default On Guardrails** | **默认开启的防护栏** | 默认开启的防护栏
Guardrail Policies | 防护栏策略 | 防护栏策略
**Using Guardrails Client Side** | **在客户端使用防护栏** | 在客户端使用防护栏
Test yourself **(OSS)** | 自己动手测试 **（OSS）** | 自己动手测试-oss
Inspect guardrail results in the response **(OSS)** | 在响应中查看防护栏结果 **（OSS）** | 在响应中查看防护栏结果-oss
Expose to your users **(Enterprise)** | 开放给你的用户 **（企业版）** | 开放给你的用户-企业版
1. View Available Guardrails | 1. 查看可用防护栏 | 1-查看可用防护栏
2. Apply Guardrails | 2. 应用防护栏 | 2-应用防护栏
3. Test with Mock LLM completions | 3. 用 Mock LLM 补全测试 | 3-用-mock-llm-补全测试
4. ✨ Pass Dynamic Parameters to Guardrail | 4. ✨ 向防护栏传递动态参数 | 4--向防护栏传递动态参数
**Proxy Admin Controls** | **代理管理控制** | 代理管理控制
Monitoring Guardrails | 监控防护栏 | 监控防护栏
Setup | 设置 | 设置
Traced Guardrail Success | 追踪到的防护栏成功 | 追踪到的防护栏成功
Traced Guardrail Failure | 追踪到的防护栏失败 | 追踪到的防护栏失败
✨ Control Guardrails per API Key | ✨ 按 API 密钥控制防护栏 | 按-api-密钥控制防护栏
✨ Tag-based Guardrail Modes | ✨ 基于标签的防护栏模式 | 基于标签的防护栏模式
✨ Model-level Guardrails | ✨ 模型级防护栏 | 模型级防护栏
✨ Disable team from turning on/off guardrails | ✨ 禁止团队开启/关闭防护栏 | 禁止团队开启关闭防护栏
1. Disable team from modifying guardrails | 1. 禁止团队修改防护栏 | 1-禁止团队修改防护栏
2. Try to disable guardrails for a call | 2. 尝试在一次调用中关闭防护栏 | 2-尝试在一次调用中关闭防护栏
3. Get 403 Error | 3. 收到 403 错误 | 3-收到-403-错误
Specification | 规格说明 | 规格说明
`guardrails` Configuration on YAML | YAML 中的 `guardrails` 配置 | yaml-中的-guardrails-配置
`guardrails` Request Parameter | `guardrails` 请求参数 | guardrails-请求参数
Format Options | 格式选项 | 格式选项
Type Definition | 类型定义 | 类型定义
