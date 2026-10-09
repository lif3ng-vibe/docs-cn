# 设置参考

本参考列出用户可配置的设置项、类型、默认值和用途。项目设置覆盖 agent 目录设置。资源列表则会合并。文件位置与信任行为参见[配置](configuration.md)。

## 模型与思考

<a id="model-cycling"></a>

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `defaultProvider` | string | 自动 | 启动时的 AI 提供商。 |
| `defaultModel` | string | 自动 | 启动时的模型 ID。 |
| `defaultThinkingLevel` | `"off" \| "minimal" \| "low" \| "medium" \| "high" \| "xhigh" \| "max"` | `"medium"` | 启动时的思考级别。 |
| `modelThinkingLevels` | object | 无 | 按精确 `provider/modelId` 键控的各模型启动思考级别。 |
| `thinkingBudgets` | object | 内置预算 | `minimal`、`low`、`medium` 和 `high` 思考级别的 token 预算。 |
| `enabledModels` | `string[]` | 所有可用模型 | 用于启动选择和模型循环切换的模型模式。格式与 `--models` 相同。 |
| `hideThinkingBlock` | boolean | `false` | 在对话记录中隐藏思考块。 |
| `showCacheMissNotices` | boolean | `false` | 显示重大缓存未命中、缓存预热成功、压缩用量以及提供商恢复的通知。 |
| `cacheWarming` | `"off" \| "streaming" \| "idle"` | `"streaming"` | 在运行期间保持符合条件的提供商提示词缓存热度；设为 `"idle"` 则在运行间隙保持。仅限全局设置。 |

只有当模型声明了缓存有效期、且 Pi 估算可避免的缓存未命中成本不低于 $0.05 时，缓存预热才会运行。刷新用量计入会话总量，但不进入模型上下文。`/session` 会显示下一次决定；扩展可以用 `cache_warming_decision` 覆盖它。参见[提示词缓存有效期](models.md#prompt-cache-lifetimes)。

模型选择与思考控制参见[选择模型](models.md)。

## 交互

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `steeringMode` | `"all" \| "one-at-a-time"` | `"one-at-a-time"` | 排队的引导消息如何送达。 |
| `followUpMode` | `"all" \| "one-at-a-time"` | `"one-at-a-time"` | 排队的追问消息如何送达。 |
| `externalEditor` | string | `$VISUAL`、`$EDITOR`，然后是平台默认值 | 外部编辑器按键绑定打开的命令。 |
| `doubleEscapeAction` | `"tree" \| "fork" \| "none"` | `"tree"` | 编辑器为空时双击 Escape 触发的动作。 |
| `treeFilterMode` | `"default" \| "no-tools" \| "user-only" \| "labeled-only" \| "all"` | `"default"` | `/tree` 使用的初始过滤器。 |
| `defaultProjectTrust` | `"ask" \| "always" \| "never"` | `"ask"` | 兜底的项目信任行为。**只能在 agent 目录设置中设置**。 |

## 工具

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `defaultTools` | `string[]` | `read`、`bash`、`edit`、`write` | 启动时启用的工具。普通名称替换默认值；`+name` 添加工具，`-name` 移除工具。空数组禁用所有内置工具，但不影响扩展或 SDK 工具。 |
| `codemode.mode` | `"on"` \| `"only"` | `"on"` | `codemode` 工具激活时如何呈现其他工具。`on`：已声明的工具在其描述后附加从脚本调用它们的说明，`codemode` 只列出未声明的工具。`only`：`codemode` 列出脚本可调用的所有工具，已启用的内置与扩展工具对模型隐藏，模型只能通过 `codemode` 访问它们。 |
| `codemode.inlineBudget` | number | `3000` | `codemode` 工具描述可用于工具声明的估算 token 数（字符数 / 4）。放不下的工具会被略过，用 `searchTools()` 查找。`0` 表示只列出命名空间。 |

可用的内置工具是 `read`、`bash`、`powershell`、`edit`、`write`、`grep`、`find` 和 `ls`。`defaultTools` 还可以指名 `codemode` 和 `tool_search`（由内置扩展注册为非激活状态），以及其他注册为非激活状态的扩展工具。

仅由 `+name` 和 `-name` 条目组成的列表会修改继承的选择，而不是替换它。例如，下面这样会在默认工具旁启用 `codemode`：

```json
{
  "defaultTools": ["+codemode"]
}
```

下面这条把 `bash` 替换为 `powershell` 并启用 `grep`：`["-bash", "+powershell", "+grep"]`。项目设置叠加在用户设置之上：只含 `+name` 和 `-name` 条目的项目列表会修改用户的选择，含普通名称的项目列表则替换它。在同一个列表中，普通名称先构成选择，`+name` 和 `-name` 再按顺序应用。

`/reload` 会启用新加入 `defaultTools` 的工具。它不会禁用从中移除的工具，也不会重新启用你关掉且未变更的工具。带普通名称的 `--tools`、`--no-tools` 和 `--no-builtin-tools` 会覆盖 `defaultTools`，重新加载时也是如此。

CLI 工具选项只对一次调用覆盖此设置。仅含 `+name` 和 `-name` 条目的 `--tools` 则修改解析后的 `defaultTools` 选择，例如 `pi --tools +codemode`。`/reload` 时，这些条目同样作用于重新加载后的设置，因此用 `-name` 移除的工具会保持移除。参见[命令行](cli.md#%E5%B7%A5%E5%85%B7)。

## 会话与上下文

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `sessionDir` | string | agent 会话目录 | 会话存储目录。相对路径从工作目录解析。`PI_CODING_AGENT_SESSION_DIR` 和 `--session-dir` 会覆盖此设置。 |

### 压缩

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `compaction.enabled` | boolean | `true` | 启用自动压缩。 |
| `compaction.reserveTokens` | number | `16384` | 为模型响应预留的 token 数。 |
| `compaction.keepRecentTokens` | number | `20000` | 不做摘要而保留的近期 token 数。 |
| `compaction.modelOverrides` | object | 无 | 按精确 `provider/modelId` 键控的各模型 token 设置。 |

<a id="per-model-compaction-overrides"></a>

压缩 token 值必须是非负安全整数。每个值独立解析：先看匹配的模型覆盖，再看普通压缩设置，最后是内置默认值。项目与用户的对象在模型查找前先行合并。

触发、摘要与校验行为参见[压缩参考](compaction.md)。

### 分支摘要

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `branchSummary.reserveTokens` | number | `16384` | 摘要分支历史时预留的 token 数。 |
| `branchSummary.skipPrompt` | boolean | `false` | 跳过分支摘要询问，默认不做摘要。 |

## 终端与显示

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `theme` | string | `"system"` | 内置或自定义主题名。`system` 从终端主题取色。 |
| `quietStartup` | boolean \| `"header"` | `false` | `true` 隐藏启动横幅和已加载资源列表。`"header"` 保留横幅（版本与按键提示）但隐藏模型范围行和已加载资源列表。 |
| `tuiMode` | `"regular" \| "fullscreen"` | `"fullscreen"` | 交互终端 UI 模式。 |
| `fullscreenExitOutput` | `"transcript" \| "resume-hint"` | `"transcript"` | 全屏模式退出时打印的输出。 |
| `fullscreenScrollbar` | `"auto" \| "always" \| "hidden"` | `"auto"` | 全屏对话记录滚动条的行为。 |
| `fullscreenCopyOnSelect` | boolean | `true` | 全屏模式下自动复制选中的文本。 |
| `fullscreenWheelScrollLines` | `"auto"` \| number | `"auto"` | 全屏模式下每个鼠标滚轮事件滚动的行数，取值 1 到 100。`"auto"` 在本地 macOS 终端（本身已对滚轮和触控板输入加速）中每个事件移动一行；在其他环境以及通过 SSH 时，快速滚动会被加速到每个事件最多 6 行。Alt+滚轮的移动距离为五倍。 |
| `editorPaddingX` | number | `0` | 编辑器水平内边距，取值 0 到 3 个单元格。 |
| `outputPad` | `0 \| 1` | `1` | 消息、工具输出、`!` 命令输出和摘要块的水平对话记录内边距。 |
| `autocompleteMaxVisible` | number | `5` | 自动补全可见条目数，取值 3 到 20。 |
| `showHardwareCursor` | boolean | `false` | 使用终端光标而非 Pi 绘制的光标。Pi 仍会为输入法定位它。 |
| `terminal.showImages` | boolean | `true` | 受支持时显示内联图片。 |
| `terminal.imageWidthCells` | number | `60` | 内联图片的首选宽度（以终端单元格计）。 |
| `terminal.clearOnShrink` | boolean | `false` | 渲染内容缩小时清空空行。 |
| `terminal.showTerminalProgress` | boolean | `false` | 在终端标签页显示 OSC 9;4 进度。 |
| `terminal.hyperlinks` | `boolean \| "auto"` | `"auto"` | 覆盖 OSC 8 超链接检测。 |
| `terminal.images` | `"kitty" \| "iterm2" \| "auto" \| false` | `"auto"` | 覆盖内联图片协议检测。 |
| `terminal.trueColor` | `boolean \| "auto"` | `"auto"` | 覆盖真彩色检测。 |
| `images.autoResize` | boolean | `true` | 发送给模型前把图片缩放到最大 2000×2000 像素。 |
| `images.blockImages` | boolean | `false` | 阻止图片发送给模型。 |
| `markdown.codeBlockIndent` | string | `"  "` | 用于缩进渲染后代码块的前缀。 |
| `markdown.mermaid` | `"off" \| "final" \| "streaming"` | `"streaming"` | Mermaid 渲染模式。 |

格式与平台细节参见[主题](themes.md)和[终端设置](terminal-setup.md)。

## 网络与重试

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `transport` | `"auto" \| "sse" \| "websocket" \| "websocket-cached"` | `"auto"` | 支持多种传输方式的 AI 提供商的首选传输方式。 |
| `httpProxy` | string | 无 | 作为 `HTTP_PROXY` 和 `HTTPS_PROXY` 应用于 Pi 管理的 HTTP 客户端的代理 URL。**只能在 agent 目录设置中设置**。 |
| `httpIdleTimeoutMs` | number | `300000` | HTTP 头与响应体的空闲超时（毫秒）。设为 `0` 禁用。 |
| `websocketConnectTimeoutMs` | number | `15000` | WebSocket 连接超时（毫秒）。设为 `0` 禁用。 |
| `retry.enabled` | boolean | `true` | 为瞬时故障启用自动的智能体级重试。 |
| `retry.maxRetries` | number | `3` | 智能体级重试的最大次数。 |
| `retry.baseDelayMs` | number | `2000` | 指数退避的初始延迟（毫秒）。 |
| `retry.maxAgentDelayMs` | number | `60000` | 智能体级重试的最大延迟（毫秒）。 |
| `retry.provider.timeoutMs` | number | `httpIdleTimeoutMs` | 提供商请求超时（毫秒）。 |
| `retry.provider.maxRetries` | number | `0` | 提供商级重试次数。 |
| `retry.provider.maxRetryDelayMs` | number | `60000` | 服务器要求延迟的上限（毫秒）。设为 `0` 取消该限制。 |

除非确需提供商级重试，否则请保持 `retry.provider.maxRetries` 为 `0`。提供商重试可能延误 Pi 自行处理配额与用量上限错误。

## Shell

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `shellPath` | string | 平台默认值 | 自定义 shell 可执行文件路径。支持开头的 `~`。 |
| `shellCommandPrefix` | string | 无 | 前置到每条 shell 命令的前缀。 |
| `npmCommand` | `string[]` | `npm` | 用于 npm 包查找与安装的命令和参数。 |

shell 配置参见[shell 别名](shell-aliases.md)，包管理器行为参见[Pi 包](packages.md)。

## 资源

用户设置中的资源路径从 agent 目录解析。项目设置中的路径从项目 `.pi` 目录解析。支持绝对路径和 `~`。

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `packages` | array | `[]` | npm、git 或本地 Pi 包来源。参见[Pi 包](packages.md)。 |
| `extensions` | `string[]` | `[]` | 扩展文件或目录。 |
| `skills` | `string[]` | `[]` | 技能文件或目录。 |
| `prompts` | `string[]` | `[]` | 提示词模板文件或目录。 |
| `themes` | `string[]` | `[]` | 主题文件或目录。 |
| `enableSkillCommands` | boolean | `true` | 将技能注册为 `/skill:name` 命令。 |

资源数组支持用 `!pattern` 做 glob 排除、用 `+path` 精确包含、用 `-path` 精确排除。Pi 会加载用户级与项目设置中列出的资源。

内置扩展在 `extensions` 中名为 `builtin:mcp`、`builtin:llama.cpp`、`builtin:codemode` 和 `builtin:tool-search`。它们默认加载；`-builtin:mcp` 可禁用其中一个。项目设置中的 `+builtin:<name>` 或 `-builtin:<name>` 条目会覆盖用户设置。`pi config` 在 Built-in 下列出它们。`--no-extensions` 也会禁用它们，`-e builtin:<name>` 则显式加载其中一个。

## 更新、遥测与警告

| 设置 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `collapseChangelog` | boolean | `false` | 更新后显示精简的更新日志。 |
| `enableInstallTelemetry` | boolean | `true` | 启用匿名的安装/更新上报和所选提供商归因头。不控制更新检查。 |
| `enableAnalytics` | boolean | `false` | 选择加入分析数据共享。目前仅由实验性的首次运行设置使用。 |
| `warnings.anthropicExtraUsage` | boolean | `true` | 当 Anthropic 订阅认证可能使用付费超额用量时发出警告。 |
