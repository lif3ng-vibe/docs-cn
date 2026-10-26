---
title: "调查"
description: "审阅 Agent 活动、排查失败原因，并阅读支撑证据。"
slug: "/proxy/lens/investigations"
---

# 调查

## 运行你的第一次调查

你需要一个[正在运行的 Lens 服务](./deployment.md)、独立 Lens 或其所连接网关的管理员权限，以及至少一条[已记录的 Agent 追踪记录](./first-trace.md)。

### 1. 启用调查 {#connect-the-analyzer}

按照[配置分析模型](https://github.com/BerriAI/lens/blob/main/docs/analysis.md)的说明，在 Lens 服务器上配置分析模型及其提供商凭据。然后打开 **Settings > Analysis**，选择 **Check configuration**。当调查工作线程就绪后，已配置的模型应当显示 **Analysis is configured**。

提供商凭据保存在 Lens 服务器上。你可以为每个调查选择分析模型和月度花费上限。Lens 既可以直连提供商，也可以使用显式配置的 LiteLLM 模型端点。就绪检查确认的是配置本身；第一次调查才会真正验证提供商的访问。

### 2. 选择追踪记录 {#choose-the-traces}

点击 **New investigation**。在 **Activity** 中为调查命名，并选择一个 **Agent**。下拉列表会列出已记录的 Agent 名称；留空则包含所有可访问的活动。打开 **Advanced filters**，可以选择 Agent 追踪记录、LLM 请求，或两者都选，也可以把范围限定到某个团队，或添加元数据条件。请求分析使用存储在 ClickHouse 中的请求日志。元数据条件会对已记录的键和值做精确匹配。

设置 **Review the last** 和 **Sample (%)**，选定时间窗口和命中运行的抽样百分比。默认审查最近一天内 100% 的命中活动。调整选择时预览会随之更新，方便你查看某条命中的运行。

### 3. 描述要检查的内容 {#describe-what-to-check}

点击 **Continue** 打开 **Criteria**。在 **What should the agent be doing?** 中描述你的 Agent 应该做什么。

例如：

> 研究型 Agent 基于信息来源回答用户的问题。它会在撰写最终答案前核对来源，并在无法核实某个论断时明确说明。

在 **Watch for** 下，勾选你想要检查的行为。使用 **Add your own** 可以描述其他检查项。即使这些留空，预期行为也会被检查。例如：

```text
Find claims that conflict with the retrieved sources.
Find tool failures that the agent does not recover from.
Find repeated searches that add no new information.
```

设置完成后，你可以在 **Criteria** 下查看这些内容，并通过操作菜单中的 **Edit investigation** 修改它们。

### 4. 开始运行 {#start-the-run}

点击 **Continue** 打开 **Run**。在 **Advanced options** 下，确认 **Analysis model** 和 **Monthly limit (USD)**，也可以视需要设置 **Maximum runs**，或挑选具体的运行。开始前，用量提示会显示所选模型和花费上限。

Lens 会通过其配置的提供商连接，把选中的追踪内容发送给该模型。提供商侧的费用照常产生。更改调查所用的模型，不会影响你的 Agent 自身的模型连接。

只运行一次的话，取消勾选 **Keep watching for new traces**，然后点击 **Run investigation**。要持续监控的话，保持勾选，把 **Check every** 设为想要的间隔，再点击 **Run and monitor**。

Lens 会并行审查选中的运行，把相似的观察归为一组，并在保存发现前核对原始证据。

使用 **Run now** 可以按已保存的设置再发起一次调查。定时调查也使用同样的设置。使用操作菜单中的 **Duplicate**，可以在不改动原有调查的情况下提出一次性的问题，或对不同的选择范围进行调查。使用 **Pause monitoring** 可以停止定时调查。

## 阅读调查结果

调查完成后，打开 **Findings**。**Needs attention** 按优先级列出问题。**Patterns** 展示其他观察，包括成功恢复的情况和有价值的行为。

打开一条发现，可以了解发生了什么以及建议的下一步。展开 **Evidence by run** 查看引用的原文。点击 **Open original step** 可以在对应追踪记录中查看被引用的步骤。

![一条示例发现，包含建议的下一步和支撑证据。](/img/lens/investigation-findings.png)

使用 **History** 可以回到某次历史运行，查看它的发现、设置、进度、总时长和费用。时长包含等待工作线程的时间。**Traces** 标签页显示该次运行所选的活动；如果选择了相应活动类型，该标签页会显示为 **Requests** 或 **Traces & requests**。

调查结果描述的是被审查的样本。**Linked runs** 统计的是被引用为佐证的运行数，并不是全部失败的数量。证据中还可能包含带标注的反例。

### 提供反馈

如果 Lens 把预期行为标记成了问题，请在 **Feedback** 中说明原因，并点击 **This is expected**。对同一个调查，Lens 会在后续调查中使用这条反馈。

修复问题后，点击 **Mark resolved**。如果同样的问题在新运行中再次出现，Lens 可能会重新打开它。

## 调查的运行方式

Lens 运行在你自己的基础设施上，拥有自己的调度器、执行过程和保存的结果。即使你关闭仪表板，它也会继续运行。多个副本通过 ClickHouse 中的状态协调工作，并调用配置好的分析提供商。

每个调查都有自己独立的月度花费上限。Lens 会在调用提供商之前预留预算，并把已知的已完成调用成本记入运行历史，包括在取消过程中才完成的调用。如果你通过网关模型密钥（gateway model key）路由分析请求，该密钥已有的网关计费和限制同样生效。
