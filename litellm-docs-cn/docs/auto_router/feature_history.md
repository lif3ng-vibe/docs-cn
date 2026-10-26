---
title: Auto Router 功能历史
sidebar_label: Auto Router 功能历史
description: 哪些 Auto Router 功能随哪个 LiteLLM 版本发布，让你升级时心里有数。
---

每个版本都附有 GitHub 发布页与完整发布说明的链接，按时间从新到旧排列。列在某个版本下的功能，自该版本起即可使用。

## v1.104.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.104.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.104.0/v1-104-0)

:::danger 破坏性变更

**原生上下文压缩**（context compaction）默认启用。对携带完整对话历史且受支持的请求，系统会在接近所选模型输入上限时摘要较早的对话轮次，让请求得以继续被服务。该行为覆盖 Chat Completions、Responses 与 Messages，需要模型具备可用的原生压缩器，且会新增一笔单独计费的调用。设置 `context_compaction: false` 可将其关闭。已存储或不透明的原生历史仍由客户端自行管理。[#42074](https://github.com/BerriAI/litellm/pull/42074)

**上下文窗口升级（context-window escalation）改为需显式开启**。省略 `enable_context_window_escalation` 时，超长请求不再自动升到更大的层级（tier）。将其设为 `true` 可保留原有的自动升级行为。[#41872](https://github.com/BerriAI/litellm/pull/41872)

:::

- **Heuristic v2 阈值可配置**。在配置文件或仪表板（dashboard）中设置 `heuristic_v2_success_threshold`，控制层级选择所需的最低预测成功率；清除该项即恢复训练产物的默认值。[#42252](https://github.com/BerriAI/litellm/pull/42252)
- **JEV 的仪表板配置与连接检查**。可在 LLM 分类器（classifier）旁配置 JEV，编辑配置时保留其设置，并能将分类器与层级模型分开测试。付费路由预览会强制执行虚拟密钥（virtual key）预算；加密的委派任务走已配置的回退机制，不收取 JEV 费用。[#41886](https://github.com/BerriAI/litellm/pull/41886)，[#41879](https://github.com/BerriAI/litellm/pull/41879)
- **Capability 与 Fuse 的预测详情**。请求日志会展示 Capability 的解题概率与阈值，或两个 Fuse 求解器各自的概率与质量差距。当健康或模态规则改变最终落点时，预测信息仍然可见。[#42057](https://github.com/BerriAI/litellm/pull/42057)
- **仪表板提供更多高级设置**。可编辑启发式关键词覆盖、housekeeping 路由、提醒标记、plan 模式哨兵、输出 Token 上限与自定义分类器超时。保存其他无关改动不会影响这些设置。[#42293](https://github.com/BerriAI/litellm/pull/42293)
- **内部用户的节省与用量**。管理员可查看内部用户的 Savings 与 Auto Router 用量标签页，包括通过 JWT 归属的流量；其他用户可查看自己的 Savings，路由器用量仍仅管理员可见。[#42026](https://github.com/BerriAI/litellm/pull/42026)
- **缓存断点移动后仍保持提示词缓存亲和**。启用 `prompt_caching` 调用前检查后，即使 Claude Code 把缓存断点移到更新的轮次，部署亲和（deployment affinity）关系依然保留，有助于维持提供商侧已缓存的前缀。[#42080](https://github.com/BerriAI/litellm/pull/42080)

## v1.103.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.103.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.103.0/v1-103-0)

- **Capability 分类**。`classifier_type: capability` 预测高效求解器能否独立完成整个任务，当估计值低于配置的阈值时，路由到 capable 层级。[#41270](https://github.com/BerriAI/litellm/pull/41270)
- **Fuse v2 分类（实验性）**。`classifier_type: llm_v2` 用一次评审调用同时预测两个求解器，再按质量差距策略在两者之间选择。预测无效或提供商出错时回退到 capable 求解器。[#41272](https://github.com/BerriAI/litellm/pull/41272)
- **Capability 与 Fuse 的仪表板配置**。在专属标签页中配置 efficient、capable 与 judge 模型，并提供预测策略控制与高级路由选项。保存任一表单会关闭自适应路由、上下文窗口升级与升级关键词。[#41315](https://github.com/BerriAI/litellm/pull/41315)，[#41371](https://github.com/BerriAI/litellm/pull/41371)
- **Fuse 模型与 harness 预设**。可在 YAML、API 或仪表板中选用官方维护的求解器与 harness 描述，预览其文本，或替换为自定义描述。[#41617](https://github.com/BerriAI/litellm/pull/41617)
- **TypeSafe JEV 分类器**。`classifier_type: jev` 用 JEV 选择复杂度层级，并记录其概率、置信度与分类器成本。失败时沿用既有的分类器回退与熔断器（circuit breaker）。[#41615](https://github.com/BerriAI/litellm/pull/41615)
- **按模型的 Fast 模式**。对受支持的层级模型，可在推理力度（reasoning effort）旁单独切换每个模型的 Fast 开关。[#41282](https://github.com/BerriAI/litellm/pull/41282)
- **层级内模型亲和**。启用部署亲和后，会话回到某一层级时会继续使用上次选中的可用模型。在层级重分类保持开启的情况下，Redis 会在多个 worker 之间共享这些选择。[#41174](https://github.com/BerriAI/litellm/pull/41174)
- **团队成员路由器管理**。管理员可为团队启用 `/auto_router/manage`，让成员能够创建路由器并编辑自己的配置，且只能使用其有权访问的模型。[#41175](https://github.com/BerriAI/litellm/pull/41175)
- **更准确的节省估算**。基线成本采用持久的缓存前缀历史与过期信息，保留路由分叉前已观测到的成本，无法估算时标记为未知。Anthropic Fast 模式与地域定价修正也已纳入。[#41177](https://github.com/BerriAI/litellm/pull/41177)，[#41341](https://github.com/BerriAI/litellm/pull/41341)
- **Heuristic v2 分数可见**。即使关闭消息日志，路由详情也会展示预估成功率、阈值与预测层级。发生路由覆盖后，预测结果仍与最终层级分开记录。[#42001](https://github.com/BerriAI/litellm/pull/42001)
- **编码代理会话反馈**。LLM API 密钥可读取自己的路由器会话统计。Claude Code 会展示记录在案的服务模型，Claude Code 与 Codex 都会用路由器名称标注实际花费。[#41116](https://github.com/BerriAI/litellm/pull/41116)，[#41186](https://github.com/BerriAI/litellm/pull/41186)
- **CLI 命令名称**。请使用 `lite autoroute start` 与 `lite autoroute stop`；`up` 与 `down` 仍可用，但已废弃。[#41672](https://github.com/BerriAI/litellm/pull/41672)
- **Capability 与 Fuse 的许可限制**。没有 `auto_router` 授权（entitlement）时，可使用一个 Capability 路由器和一个 Fuse v2 路由器；再增加任一类型的路由器都需要该授权。[#41326](https://github.com/BerriAI/litellm/pull/41326)

## v1.102.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.102.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.102.0/v1-102-0)

- **感知 harness 的分类**。分类时剔除 Claude Code 的系统文本与 Codex 的提醒包裹内容，同时保留委派任务与原始路由请求。[#40655](https://github.com/BerriAI/litellm/pull/40655)，[#40599](https://github.com/BerriAI/litellm/pull/40599)
- **加密委派任务**。在原生 OpenAI 或 Azure OpenAI Responses 分类器调用中保留加密任务块。不支持的部署与解密失败按 `classifier_fallback` 处理。[#40608](https://github.com/BerriAI/litellm/pull/40608)
- **分类器输入日志**。可在 Classify 行中分别查看发往提供商的分类器输入、脱敏后的原始请求与分类器响应。[#40604](https://github.com/BerriAI/litellm/pull/40604)
- **Heuristic v1 调优**。没有 `auto_router` 许可特性时，仍可继续编辑一个已调优的路由器。[#39952](https://github.com/BerriAI/litellm/pull/39952)
- **语义路由冷启动更快**。首个路由层只构建一次，且移出事件循环构建。[#39954](https://github.com/BerriAI/litellm/pull/39954)
- **自适应路由器修复**。从 `model_info` 读取模型定价，并在重启后保留 bandit 先验。[#39957](https://github.com/BerriAI/litellm/pull/39957)，[#39955](https://github.com/BerriAI/litellm/pull/39955)
- **跨提供商工具历史**。`/v1/messages` 可以在 OpenAI 与 Anthropic 层级之间重放 `tool_use` 块。[#39967](https://github.com/BerriAI/litellm/pull/39967)

本版本还包含：声明式自定义启发式维度与仪表板权重编辑 [#40156](https://github.com/BerriAI/litellm/pull/40156)，[#40205](https://github.com/BerriAI/litellm/pull/40205)；可选的 `NON_REASONING` 层级 [#40273](https://github.com/BerriAI/litellm/pull/40273)；层级模型的输出上限 [#40209](https://github.com/BerriAI/litellm/pull/40209)；层级无法服务请求时的健康默认回退 [#40757](https://github.com/BerriAI/litellm/pull/40757)；Claude Code 与 Codex 中的路由模型与会话节省 [#40330](https://github.com/BerriAI/litellm/pull/40330)；以及响应头中的层级、原因、分数与推理力度 [#40792](https://github.com/BerriAI/litellm/pull/40792)。

[感知 harness 的路由更新](https://docs.litellm.ai/blog//blog/auto-router-harness-aware-classification)

## v1.101.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.101.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.101.0/v1-101-0)

- **启发式分类器（heuristic classifiers）**。`heuristic_v2` 在本地完成路由判断；`hybrid` 在接近层级边界时才调用 LLM。[#39276](https://github.com/BerriAI/litellm/pull/39276)，[#39403](https://github.com/BerriAI/litellm/pull/39403)。[文章](https://docs.litellm.ai/blog//blog/heuristic-v2)
- **上下文与用户轮次路由**。可将超长提示词装入某个层级，并支持在配置后只对新用户轮次做分类。[#38844](https://github.com/BerriAI/litellm/pull/38844)，[#38861](https://github.com/BerriAI/litellm/pull/38861)，UI [#39042](https://github.com/BerriAI/litellm/pull/39042)，[#39054](https://github.com/BerriAI/litellm/pull/39054)
- **图片路由**。把图片发送到具备视觉能力的层级，并可选让分类器读取图片内容。[#39032](https://github.com/BerriAI/litellm/pull/39032)，[#39454](https://github.com/BerriAI/litellm/pull/39454)，[#39825](https://github.com/BerriAI/litellm/pull/39825)，UI [#39059](https://github.com/BerriAI/litellm/pull/39059)，[#39840](https://github.com/BerriAI/litellm/pull/39840)
- **停滞升级（stall escalation）**。当代理反复重复工具调用或报错时，把请求提升一个层级。[#39809](https://github.com/BerriAI/litellm/pull/39809)。[文章](https://docs.litellm.ai/blog//blog/auto-router-stall-escalation)
- **分类器控制项**。可设置分类器的推理力度、总超时时间，以及针对反复超时的熔断器。[#39372](https://github.com/BerriAI/litellm/pull/39372)，[#39696](https://github.com/BerriAI/litellm/pull/39696)，[#39701](https://github.com/BerriAI/litellm/pull/39701)
- **层级故障转移与压缩**。某层级处于冷却（cooldown）时改用同层级中的可用模型，并可按路由或按模型跳（model hop）选择压缩方式。[#39675](https://github.com/BerriAI/litellm/pull/39675)，[#39823](https://github.com/BerriAI/litellm/pull/39823)。[文章](https://docs.litellm.ai/blog//blog/auto-router-per-hop-compression)
- **影子评估（shadow eval）定向**。可按团队、用户与模型组（model group）定向，最多对比四个路由器，并对工具调用轮次进行评审。[#39015](https://github.com/BerriAI/litellm/pull/39015)，[#39028](https://github.com/BerriAI/litellm/pull/39028)，[#39817](https://github.com/BerriAI/litellm/pull/39817)，[#39818](https://github.com/BerriAI/litellm/pull/39818)，[#39828](https://github.com/BerriAI/litellm/pull/39828)
- **配置与提示词编辑**。可基于现有模型配置全部层级，按小节编辑内置提示词，并在 UI 中设置会话亲和（session affinity）TTL。[#39679](https://github.com/BerriAI/litellm/pull/39679)，[#39688](https://github.com/BerriAI/litellm/pull/39688)，[#39693](https://github.com/BerriAI/litellm/pull/39693)
- **预设（presets）**。新增 1M Context 预设，更新 OpenAI Family，并在运行时提供预设目录。[#39412](https://github.com/BerriAI/litellm/pull/39412)，[#39490](https://github.com/BerriAI/litellm/pull/39490)，[#39396](https://github.com/BerriAI/litellm/pull/39396)，[#39797](https://github.com/BerriAI/litellm/pull/39797)
- **Claude Code 支持**。子代理请求经所选路由器转发，在 `/v1/models` 中暴露其模式，并把路由用到的嵌入（embedding）调用计入调用方。[#39239](https://github.com/BerriAI/litellm/pull/39239)，[#39619](https://github.com/BerriAI/litellm/pull/39619)，[#39532](https://github.com/BerriAI/litellm/pull/39532)
- **破坏性变更**。`auto_router` 许可特性对自定义功能按量计费，影子评估结果的关键字段也已重命名。[#39468](https://github.com/BerriAI/litellm/pull/39468)，[#39674](https://github.com/BerriAI/litellm/pull/39674)，[#39015](https://github.com/BerriAI/litellm/pull/39015)

相关文章：[按上下文长度与模态路由](https://docs.litellm.ai/blog//blog/auto-router-more-routing-configurations)、[任务中途停滞升级](https://docs.litellm.ai/blog//blog/auto-router-stall-escalation)、[逐跳压缩](https://docs.litellm.ai/blog//blog/auto-router-per-hop-compression)。

## v1.100.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.100.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.100.0/v1-100-0)

- **自定义层级集合**。可为 LLM 分类器定义自己的层级，预览最终使用的分类器提示词，关键词规则随重命名自动更新。[#38602](https://github.com/BerriAI/litellm/pull/38602)，[#38603](https://github.com/BerriAI/litellm/pull/38603)，[#38605](https://github.com/BerriAI/litellm/pull/38605)。
- **启发式优先串联**。`classifier_type: heuristic_first` 先在本地打分，仅在必要时才调用 LLM 分类器。[#38428](https://github.com/BerriAI/litellm/pull/38428)。
- **分类器上下文预算**。以跨轮次的字符预算取代原先每轮 200 字符的截断。[#38141](https://github.com/BerriAI/litellm/pull/38141)，[#38145](https://github.com/BerriAI/litellm/pull/38145)。
- **Housekeeping 提示词跳过分类器**。客户端的 housekeeping 消息直接发往最便宜的层级，不再调用分类器。[#38598](https://github.com/BerriAI/litellm/pull/38598)。
- **Gemini Family 预设；Lite 与 Anthropic 预设支持按层级设置推理力度**。[#38138](https://github.com/BerriAI/litellm/pull/38138)，[#38482](https://github.com/BerriAI/litellm/pull/38482)，[#38490](https://github.com/BerriAI/litellm/pull/38490)。
- **保存前试运行校验**。UI 会通过 `/auto_router/validate_complexity_router_config` 校验配置；`/auto_router/test_routing` 可接收真实请求体。[#38595](https://github.com/BerriAI/litellm/pull/38595)。
- **层级固定的推理力度优先**。层级上的 `reasoning_effort` 优先于客户端携带的取值；层级不支持的参数会被丢弃，而不是导致整个层级失败。[#38622](https://github.com/BerriAI/litellm/pull/38622)，[#38698](https://github.com/BerriAI/litellm/pull/38698)。
- **计入分类器成本**。节省数据、基准测试与影子评估都会扣除路由器自身的分类器开销。[#38835](https://github.com/BerriAI/litellm/pull/38835)，[#38631](https://github.com/BerriAI/litellm/pull/38631)。
- **路由器健康取决于其模型**。当任一层级模型、默认模型或分类器模型无法服务时，路由器会被标记为异常。[#37966](https://github.com/BerriAI/litellm/pull/37966)，[#38174](https://github.com/BerriAI/litellm/pull/38174)。
- **`model_group_alias` 支持自动路由器**。[#38272](https://github.com/BerriAI/litellm/pull/38272)，[#38382](https://github.com/BerriAI/litellm/pull/38382)。
- **破坏性变更**。放在 `complexity_router_config` 之外的设置会被拒绝（[#38570](https://github.com/BerriAI/litellm/pull/38570)）。`router_model_name` 已移除，请改用 `return_raw_model_name`（[#38429](https://github.com/BerriAI/litellm/pull/38429)）。`autorouter_savings_baseline_model` 已删除；每个路由器从其最难的层级推导基线（[#38700](https://github.com/BerriAI/litellm/pull/38700)）。

## v1.99.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.99.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.99.0/v1-99-0)

- **运营者自定义的层级集合**，供 LLM 分类器使用。[#37226](https://github.com/BerriAI/litellm/pull/37226)。
- **自定义分类器插件**。`classifier_type: custom` 配合指向你自己 `classify()` 的点分路径。[#37249](https://github.com/BerriAI/litellm/pull/37249)。
- **plan 模式层级下限**，面向编码代理客户端。[#37230](https://github.com/BerriAI/litellm/pull/37230)。
- **按层级配置 `litellm_params`**，层级编辑器中还支持按模型设置推理力度。[#37064](https://github.com/BerriAI/litellm/pull/37064)，[#37673](https://github.com/BerriAI/litellm/pull/37673)。
- **商务分类评分规则（rubric）预设**。[#37534](https://github.com/BerriAI/litellm/pull/37534)。
- **Lite 预设**（混合提供商）与 UI 中的启发式打分器设置。[#37068](https://github.com/BerriAI/litellm/pull/37068)，[#37216](https://github.com/BerriAI/litellm/pull/37216)。
- **影子评估：每个任务可配多个密钥，预算以美元计**。`api_key_ids` 取代 `api_key_id`，`max_budget` 取代 `max_turns`（破坏性变更）。[#37251](https://github.com/BerriAI/litellm/pull/37251)，[#37555](https://github.com/BerriAI/litellm/pull/37555)。
- **Responses API** 的输入可经自动路由器路由。[#37333](https://github.com/BerriAI/litellm/pull/37333)。
- **节省数据接入回调并支持按密钥查看**。每条请求的节省数据会传给日志回调（callback）；密钥页面新增 Savings 标签页。[#37894](https://github.com/BerriAI/litellm/pull/37894)，[#37693](https://github.com/BerriAI/litellm/pull/37693)。

## v1.98.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.98.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.98.0/v1-98-0)

- **影子评估**。抽样某个密钥的真实流量，经路由器重放但不返回响应；支持盲评 LLM 评审、反向模式，覆盖 `/v1/messages` 与 `/v1/responses`。[#36587](https://github.com/BerriAI/litellm/pull/36587)，[#36830](https://github.com/BerriAI/litellm/pull/36830)，[#36865](https://github.com/BerriAI/litellm/pull/36865)。UI [#36588](https://github.com/BerriAI/litellm/pull/36588)，[#36994](https://github.com/BerriAI/litellm/pull/36994)。[文章](https://docs.litellm.ai/blog//blog/auto-router-shadow-evaluations)。
- **经过校准的分类器评分规则**，附带完整示例，可按路由器选择；系统提示词文本不再参与评分。[#36578](https://github.com/BerriAI/litellm/pull/36578)，[#36721](https://github.com/BerriAI/litellm/pull/36721)。
- **UI 中新增部署亲和开关**；基准测试图表会在每个层级下显示模型。[#36302](https://github.com/BerriAI/litellm/pull/36302)，[#36291](https://github.com/BerriAI/litellm/pull/36291)。
- **标签路由门控（tag routing gates）**。支持必选 AND 标签前缀与 `allow_fail_open`，未打标签的请求会绕过绑定标签的路由前置策略。[#36193](https://github.com/BerriAI/litellm/pull/36193)，[#36627](https://github.com/BerriAI/litellm/pull/36627)，[#36628](https://github.com/BerriAI/litellm/pull/36628)。

## v1.97.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.97.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.97.0/v1-97-0)

- **部署亲和默认开启**（破坏性变更）。会话回到同一模型组时，会落在之前用过的那份部署上，让提供商缓存保持温热。设置 `deployment_affinity: false` 可恢复旧行为。[#36146](https://github.com/BerriAI/litellm/pull/36146)。
- **会话亲和默认关闭**，该开关已在 UI 中暴露。[#35714](https://github.com/BerriAI/litellm/pull/35714)。
- **节省与用量标签页**。Cost Optimization 页面展示自动路由器的净节省，基线取自最难层级，支持按会话汇总与各层级轮次统计。[#35522](https://github.com/BerriAI/litellm/pull/35522)，[#35995](https://github.com/BerriAI/litellm/pull/35995)，[#35521](https://github.com/BerriAI/litellm/pull/35521)，[#35907](https://github.com/BerriAI/litellm/pull/35907)，[#35910](https://github.com/BerriAI/litellm/pull/35910)，[#36209](https://github.com/BerriAI/litellm/pull/36209)。[文章](https://docs.litellm.ai/blog//blog/auto-router-spend-visibility)
- **每条请求的分类器成本**，记录在 `routing_decision` 与 `x-litellm-classifier-cost` 响应头中。[#36015](https://github.com/BerriAI/litellm/pull/36015)。
- **一键预设与 Test Routing**。添加 Auto Router 只需名称加模板；Test Routing 可在保存前预览路由选择；预设按底层模型 ID 匹配部署。[#35746](https://github.com/BerriAI/litellm/pull/35746)，[#35859](https://github.com/BerriAI/litellm/pull/35859)，[#35972](https://github.com/BerriAI/litellm/pull/35972)，[#36111](https://github.com/BerriAI/litellm/pull/36111)。[文章](https://docs.litellm.ai/blog//blog/auto-router-setup-and-testing)
- **可替换的分类器提示词与层级名称**。[#35855](https://github.com/BerriAI/litellm/pull/35855)，[#35893](https://github.com/BerriAI/litellm/pull/35893)。

## v1.96.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.96.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.96.0/v1-96-0)

- **分类器上下文窗口**。LLM 分类器可以看到此前的轮次（`classifier_context_window_size`，默认 3）。[#35185](https://github.com/BerriAI/litellm/pull/35185)。[文章](https://docs.litellm.ai/blog//blog/auto-router-context-and-benchmarks)
- **助手轮次**可选纳入（`classifier_context_include_assistant_turns`）。[#35471](https://github.com/BerriAI/litellm/pull/35471)。
- **记录路由决策**。层级、原因与分类器请求体写入花费日志与日志抽屉；路由器自身发起的分类器调用会被标记。[#35016](https://github.com/BerriAI/litellm/pull/35016)，[#35164](https://github.com/BerriAI/litellm/pull/35164)，[#35300](https://github.com/BerriAI/litellm/pull/35300)，[#35304](https://github.com/BerriAI/litellm/pull/35304)。
- **自动路由器在 Models + Endpoints 中拥有专属标签页**，并带上上下文窗口字段。[#35009](https://github.com/BerriAI/litellm/pull/35009)，[#35315](https://github.com/BerriAI/litellm/pull/35315)，[#35500](https://github.com/BerriAI/litellm/pull/35500)。

## v1.95.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.95.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.95.0/v1-95-0)

- **`return_raw_model_name`**。把选中的模型写入响应体的 `model` 字段，而不是别名。[#33875](https://github.com/BerriAI/litellm/pull/33875)。
- **日志标明路由器**。日志抽屉与会话侧边栏会标记经自动路由器服务的请求。[#34434](https://github.com/BerriAI/litellm/pull/34434)。

## v1.94.0

[GitHub 发布](https://github.com/BerriAI/litellm/releases/tag/v1.94.0)，[发布说明](https://docs.litellm.ai/release_notes/v1.94.0/v1-94-0)

- **Auto Router v2**。复杂度、语义与自适应路由合并在一个 `auto_router/complexity_router` 中。[文章](https://docs.litellm.ai/blog//blog/autorouter-v2)。
- **路由器插件（router plugins）**。支持 `Router(plugins=[...])`，可从代理配置中解析。[#32972](https://github.com/BerriAI/litellm/pull/32972)，[#33251](https://github.com/BerriAI/litellm/pull/33251)，[#33644](https://github.com/BerriAI/litellm/pull/33644)。[文章](https://docs.litellm.ai/blog//blog/router-plugins-on-the-proxy)。
- **层级池（tier pools）**。软下限自适应模式与随机挑选的多模型层级。[#32947](https://github.com/BerriAI/litellm/pull/32947)，[#32967](https://github.com/BerriAI/litellm/pull/32967)。
- **会话亲和**。把会话固定在其首轮使用的模型上。[#33126](https://github.com/BerriAI/litellm/pull/33126)，[#33500](https://github.com/BerriAI/litellm/pull/33500)，[#33723](https://github.com/BerriAI/litellm/pull/33723)。
- **升级关键词**（escalation keywords）与按层级配置的语义关键词提示词。[#33656](https://github.com/BerriAI/litellm/pull/33656)，[#33508](https://github.com/BerriAI/litellm/pull/33508)。
- **Cost Optimization 页面（beta）**，带 Autorouter 标签页。[#33899](https://github.com/BerriAI/litellm/pull/33899)。
- **自动路由器的 Test Connection** 功能。[#32950](https://github.com/BerriAI/litellm/pull/32950)，[#33146](https://github.com/BerriAI/litellm/pull/33146)。
