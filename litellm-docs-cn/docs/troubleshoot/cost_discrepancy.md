# 排查费用差异

LiteLLM 与提供商账单之间的费用差异，通常出在三个环节之一：Token 采集（ingestion）、LiteLLM 使用的成本公式，或是模型价格表（model map）里过期或错误的价格。本页会带你逐步判断自己属于哪种情况。

如果是 OpenAI，LiteLLM 可以替你完成这项比对。[花费捕获率检查](../proxy/spend_capture_rate)会通过 Organization Costs API 读取 OpenAI 账单，与 LiteLLM 在相同 UTC 日期内追踪到的花费做对比，并在捕获比例跌破阈值时告警。使用其他提供商，或者想弄清检查报出的差异从何而来，请按下面的步骤操作。

## 第 1 步：选定时间范围

先锁定一个能清晰看到差异的具体时间窗口。

- 条件允许时，尽量使用至少 7 天的数据。
- 优先选用量平稳的窗口，避免一次性尖峰主导对比结果。
- 在提供商仪表板和 LiteLLM 界面上设置**相同的起止时间**。

![LiteLLM 仪表板的日期范围选择器](/img/cost-discrepancy-debug/date-range-picker.png)

## 第 2 步：确认流量只经过 LiteLLM

如果有请求绕过 LiteLLM 直接打到提供商，提供商侧显示的用量自然会更高。这是预期现象，不是 LiteLLM 的 bug。

继续之前，请确认：

- 所有客户端都使用 LiteLLM 代理的 base URL。
- 没有 SDK 或脚本绕开 LiteLLM、拿着提供商的 API 密钥直连调用你要对比的模型。
- 在选定时间段内，相关模型只通过 LiteLLM 调用。

拿不准的话，在提供商仪表板上按 LiteLLM 实际使用的 API 密钥或 IAM 主体过滤，而不是拿整个账号的数据来比。

## 第 3 步：对比各类 Token 数量

在 LiteLLM 界面中打开 **Model activity**（位于 Usage analytics 下），即可按模型查看花费与 Token 用量。

![在 LiteLLM 界面中打开 Model activity](/img/cost-discrepancy-debug/go-to-model-activity.png)

在 **Model** 列表中滚动找到并选中你要与提供商账单核对的模型。

![在 Model activity 表格中找到你的模型](/img/cost-discrepancy-debug/scroll-to-model.png)

两边使用相同的时间范围，填写下表：

| 类别 | LiteLLM | 提供商 | 差值 |
| --- | --- | --- | --- |
| 总请求数 | — | — | — |
| 输入 Token | — | — | — |
| 输出 Token | — | — | — |
| 缓存读取 Token | — | — | — |
| 缓存写入 Token | — | — | — |

LiteLLM 会展示所选模型各类 Token 的用量，例如提示词（prompt）、补全（completion）以及缓存相关的 Token。

![LiteLLM 按 Token 类别拆分的用量](/img/cost-discrepancy-debug/token-categories.png)

再与提供商同期的用量视图对比（例如 AWS 账单工具、Azure Monitor 或 OpenAI 的用量仪表板）。

### 缓存 Token 的上报方式

- **OpenAI**：缓存读取 Token 通常已包含在上报的输入 Token 数中。
- **Anthropic**：缓存读取 Token 往往与非缓存的输入 Token 分开上报。

两边各取对应列来比，避免“输入”这个口径在两个仪表板之间不一致。

### 为什么以 10% 为阈值？

提供商仪表板与 LiteLLM 对请求的时间分桶并不完全一致，晚上 11:59 发出的一次调用，可能被计入不同日期的总量。不同 SDK 与 API 之间的舍入也会让 Token 数略有出入。差值**低于约 10%** 往往只是边界效应和舍入所致；差值**超过约 10%** 则通常意味着有数字被算错、漏掉，或者归类方式不同。

## 第 4 步：走对应的路径

<svg width="100%" viewBox="0 0 680 482" role="img" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', fontFamily: 'system-ui, sans-serif' }} aria-labelledby="cost-disc-flow-title">
  <title id="cost-disc-flow-title">费用差异排查流程图</title>
  <desc>流程图：分出路径 A（Token 采集问题）与路径 B，后者再分为 B1（公式问题）和 B2（模型价格表问题）。</desc>
  <defs>
    <marker id="cd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </marker>
  </defs>

  <rect x="215" y="24" width="250" height="44" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5" />
  <text x="340" y="47" textAnchor="middle" dominantBaseline="central" fill="#444441" fontSize="14" fontWeight="500">对比提供商与 LiteLLM</text>

  <line x1="340" y1="68" x2="340" y2="104" stroke="#888780" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />

  <rect x="175" y="104" width="330" height="56" rx="8" fill="#F1EFE8" stroke="#5F5E5A" strokeWidth="0.5" />
  <text x="340" y="126" textAnchor="middle" dominantBaseline="central" fill="#444441" fontSize="14" fontWeight="500">是否有类别相差 &gt; 10%？</text>
  <text x="340" y="148" textAnchor="middle" dominantBaseline="central" fill="#5F5E5A" fontSize="12">请求数、输入、输出、缓存 Token</text>

  <path d="M220 132 L100 132 L100 250" fill="none" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <text x="157" y="122" textAnchor="middle" fill="#0F6E56" fontSize="12">是</text>

  <path d="M505 132 L580 132 L580 250" fill="none" stroke="#993C1D" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <text x="543" y="122" textAnchor="middle" fill="#993C1D" fontSize="12">否</text>

  <rect x="40" y="250" width="220" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5" />
  <text x="150" y="271" textAnchor="middle" dominantBaseline="central" fill="#085041" fontSize="14" fontWeight="500">路径 A</text>
  <text x="150" y="291" textAnchor="middle" dominantBaseline="central" fill="#0F6E56" fontSize="12">Token 采集问题</text>

  <rect x="420" y="250" width="220" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" strokeWidth="0.5" />
  <text x="530" y="271" textAnchor="middle" dominantBaseline="central" fill="#712B13" fontSize="14" fontWeight="500">路径 B</text>
  <text x="530" y="291" textAnchor="middle" dominantBaseline="central" fill="#993C1D" fontSize="12">数量一致，费用不同</text>

  <line x1="150" y1="306" x2="150" y2="370" stroke="#0F6E56" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />

  <line x1="530" y1="306" x2="530" y2="318" stroke="#854F0B" strokeWidth="1.5" />
  <line x1="435" y1="318" x2="575" y2="318" stroke="#854F0B" strokeWidth="1.5" />
  <line x1="435" y1="318" x2="435" y2="370" stroke="#854F0B" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <line x1="575" y1="318" x2="575" y2="370" stroke="#854F0B" strokeWidth="1.5" markerEnd="url(#cd-arrow)" />
  <text x="448" y="312" textAnchor="middle" fill="#854F0B" fontSize="11">B1</text>
  <text x="562" y="312" textAnchor="middle" fill="#854F0B" fontSize="11">B2</text>

  <rect x="40" y="370" width="220" height="56" rx="8" fill="#E1F5EE" stroke="#0F6E56" strokeWidth="0.5" />
  <text x="150" y="391" textAnchor="middle" dominantBaseline="central" fill="#085041" fontSize="14" fontWeight="500">报告 LiteLLM 团队</text>
  <text x="150" y="411" textAnchor="middle" dominantBaseline="central" fill="#0F6E56" fontSize="12">端点 + 模型 + 截图</text>

  <rect x="380" y="370" width="110" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5" />
  <text x="435" y="391" textAnchor="middle" dominantBaseline="central" fill="#633806" fontSize="14" fontWeight="500">B1</text>
  <text x="435" y="411" textAnchor="middle" dominantBaseline="central" fill="#854F0B" fontSize="12">修正公式</text>

  <rect x="510" y="370" width="130" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" strokeWidth="0.5" />
  <text x="575" y="391" textAnchor="middle" dominantBaseline="central" fill="#633806" fontSize="14" fontWeight="500">B2</text>
  <text x="575" y="411" textAnchor="middle" dominantBaseline="central" fill="#854F0B" fontSize="12">修正模型价格表</text>

  <path d="M150 426 L150 442 L340 442" fill="none" stroke="#888780" strokeWidth="0.5" strokeDasharray="4 3" />
  <path d="M340 442 L435 442 L435 428" fill="none" stroke="#888780" strokeWidth="0.5" strokeDasharray="4 3" />
  <path d="M340 442 L575 442 L575 428" fill="none" stroke="#888780" strokeWidth="0.5" strokeDasharray="4 3" />
  <text x="340" y="454" textAnchor="middle" fill="#5F5E5A" fontSize="11">两条路径都没能解决时，</text>
  <text x="340" y="470" textAnchor="middle" fill="#5F5E5A" fontSize="11">请附上全部数据到 GitHub 提 issue</text>
</svg>

## 路径 A：Token 数量对不上

如果某一类数字相差超过 10% 左右，可能是 LiteLLM 没有正确采集该类数据（也可能是提供商仪表板的归类方式不同，所以先回头复查第 3 步）。

**需要提供给 LiteLLM 团队的信息**：

1. 两个仪表板的截图，日期范围要清晰可见。
2. 哪一类对不上（输入、输出、缓存读取、缓存写入，还是请求数）。
3. 用到的端点（例如 `/chat/completions`、`/responses`、`/embeddings`）。
4. 请求中原样发送的模型名（例如 `anthropic.{{anthropic_large}}`、`{{openai_large}}`）。

### 维护者如何排查采集

1. 以详细日志模式启动代理，例如：
   ```bash
   litellm --config config.yaml --detailed_debug
   ```
2. 用报告中的端点和模型复现单个请求。
3. 检查每个流式分块（如果是流式）或最终响应体中原始的 `usage` 对象。
4. 再与标准日志对象（或该次调用在界面请求日志里的记录）比对。
5. 提供商原始用量与 LiteLLM 记录、汇总结果之间的任何差异，就是采集可能出错的地方。

## 路径 B：数量一致，费用不对

如果 Token 数和请求数在约 10% 的误差内对得上，但金额对不上，重点就看成本是怎么算出来的。

### B1：公式问题

用提供商给出的 Token 明细和公开费率（每百万 Token 或每 Token）手动算一遍期望费用。

再把提供商会计入账单的其他维度加上（例如缓存创建、音频或阶梯加价）。如果你手算的结果与提供商账单一致、却与 LiteLLM 不符，那可能是 LiteLLM 针对该提供商或该模态的实现有误。

### B2：模型价格表问题

如果公式的结构与提供商的计费方式一致，那可能是 LiteLLM 模型价格表（model map）里的数值过期或不准。请交叉核对：

- [`model_prices_and_context_window.json`](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json)
- 提供商当前公开的价格

按你实际使用的模型 id（含提供商前缀）检查 `input_cost_per_token`、`output_cost_per_token` 以及所有与缓存相关的价格字段。

### 给维护者

1. 以用户提供商报告中的 Token 数量为权威依据。
2. 推导出能复现提供商账单条目的公式。
3. 将其与 LiteLLM 在相同提供商、相同响应结构下的成本计算路径做比对。
4. 如果公式一致而数值不同，更新 `model_prices_and_context_window.json` 中的价格（并遵守该项目对该文件的同步/备份规则）。
5. 如果代码中的公式本身有误，修正计算，并用该用户的 Token 明细补一条回归测试。

## 还是没解决？

1. 在 [BerriAI/litellm](https://github.com/BerriAI/litellm) 上提交 GitHub issue，附上第 3 步的对比表、端点和模型名。


在 issue 里最好说明清楚：

- 是稳定可复现，还是偶发？
- 只涉及单个模型，还是多个模型？
- 是一直如此，还是从某个发布日期或配置变更后才出现？

### 给 LiteLLM 维护者

如果分诊之后路径 A 和路径 B 都无法结案，**你**应当主动联系并**与客户约一次通话**（由支持或工程出面），带上第 3 步的表格和截图，再去处理这个 issue。

## 核对清单

```
□ Same time range on both dashboards
□ Confirmed no direct-to-provider traffic for those models
□ Compared: requests, input tokens, output tokens, cache tokens
□ Noted cache reporting differences (OpenAI vs Anthropic, and so on)
□ If > ~10% delta on quantities → Path A: report with screenshots, endpoints, model names
□ If quantities match → Path B: verify formula (B1) and model map pricing (B2)
□ If neither path fits → open a GitHub issue.
```

## 延伸阅读

- [花费追踪](../proxy/cost_tracking)
- [花费捕获率](../proxy/spend_capture_rate)
- [从 GitHub 同步模型价格](../proxy/sync_models_github)
- [Reload Price Data 后模型缺失](./missing_model)
