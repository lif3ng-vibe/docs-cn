# 环境变量

Pi 以三种方式使用环境变量：

- `PI_OFFLINE` 之类的变量配置 Pi 进程。
- Pi 设置进程标记，让子进程能识别 Pi 是启动该进程的智能体。
- 可供 LLM 调用的 shell 工具所运行的命令会收到描述当前会话的 `PI_*` 变量。

提供商 API 密钥变量另见[提供商](providers.md#use-an-api-key-from-the-environment)。

## 进程标记

CLI 与 RPC 入口会设置两个进程标记：

- `AI_AGENT=pi` 是通用标记，让工具链识别 Pi 是启动该进程的智能体。
- `PI_CODING_AGENT=true` 是 Pi 专属标记，让子进程检测到自己运行在 Pi 之中。

子进程继承这两个标记。它们不随会话而变，通过 SDK 嵌入 Pi 时也不会自动设置。

## shell 工具的会话环境

`bash` 和 `powershell` 工具运行的命令会收到当前 Pi 会话状态：

| 变量 | 说明 |
|----------|-------------|
| `PI_SESSION_ID` | 当前会话 ID |
| `PI_SESSION_FILE` | 当前会话 JSONL 文件的绝对路径；临时会话未设置 |
| `PI_PROVIDER` | 当前选中的模型提供商 |
| `PI_MODEL` | 当前选中的模型 ID |
| `PI_REASONING_LEVEL` | 当前生效的推理级别：`off`、`minimal`、`low`、`medium`、`high`、`xhigh` 或 `max` |

这些值在每条命令启动时解析。因此切换模型或更改推理级别会影响下一条 shell 命令，而无需重启 Pi。`PI_PROVIDER` 和 `PI_MODEL` 标识所选的 Pi 模型，而不是路由器可能在内部选择的其他上游模型。

被问及正在运行哪个模型或提供商时，请检查这些变量，而不要从系统提示词推断：

```bash
printf '%s/%s\n' "$PI_PROVIDER" "$PI_MODEL"
printf 'reasoning=%s session=%s\n' "$PI_REASONING_LEVEL" "$PI_SESSION_ID"
```

会话可持久化时，可以直接查看会话文件：

```bash
if [ -n "$PI_SESSION_FILE" ]; then
  tail -n 1 "$PI_SESSION_FILE"
fi
```

这些变量注入可供 LLM 调用的 `bash` 和 `powershell` 工具。不注入用户输入的 `!` 或 `!!` 命令。

### 自定义 shell 工具

用 `createBashTool()` 或 `createPowerShellTool()` 创建的工具在注册到 Pi 时默认暴露会话环境。注入发生在 `spawnHook` 之前，因此钩子会在 `ctx.env` 中收到这些变量：

```typescript
const bashTool = createBashTool(cwd, {
  spawnHook: (ctx) => ({
    ...ctx,
    env: { ...ctx.env, CI: "1" },
  }),
});
```

可以独立于 spawn 钩子禁用会话元数据：

```typescript
const powershellTool = createPowerShellTool(cwd, {
  exposeSessionEnvironment: false,
  spawnHook: (ctx) => ctx,
});
```

禁用后，Pi 会移除这些变量的继承值，以免嵌套的 Pi 进程暴露过期的父会话元数据。

## Pi 进程配置

以下变量由 Pi 自身读取：

| 变量 | 说明 |
|----------|-------------|
| `PI_CODING_AGENT_DIR` | 覆盖配置目录；默认为 `~/.pi/agent` |
| `PI_CODING_AGENT_SESSION_DIR` | 覆盖会话存储；会被 `--session-dir` 覆盖 |
| `PI_PACKAGE_DIR` | 覆盖包目录，适用于 Nix/Guix store 路径 |
| `PI_OFFLINE` | 禁用自动网络活动，包括模型目录刷新 |
| `PI_SKIP_VERSION_CHECK` | 禁用对 `pi.dev` 的最新版本请求 |
| `PI_TELEMETRY` | 覆盖安装/更新遥测与提供商归因头：`1`/`true`/`yes` 或 `0`/`false`/`no` |
| `PI_CACHE_RETENTION` | 在受支持时设为 `long` 以启用扩展的提供商提示词缓存 |
| `PI_SHARE_VIEWER_URL` | 覆盖 `/share` 使用的基 URL |
| `PI_RADIUS_GATEWAY` | 覆盖 `/bug` 上传与 Radius 中继连接使用的 Radius 网关源（origin） |
| `PI_HARDWARE_CURSOR` | 设为 `1` 显示硬件光标；参见[终端设置](terminal-setup.md) |
| `PI_HYPERLINKS` | 用 `1`、`0` 或 `auto` 覆盖 OSC 8 超链接检测 |
| `PI_PROGRAM_STATUS` | 覆盖 OSC 7501 程序状态检测：`1` 总是上报，`0` 从不上报；其他情况下 Pi 只在终端确认支持后才上报。参见[终端设置](terminal-setup.md#program-status) |
| `PI_IMAGE_PROTOCOL` | 用 `kitty`、`iterm2`、`none` 或 `auto` 覆盖内联图片检测 |
| `PI_TRUE_COLOR` | 用 `1`、`0` 或 `auto` 覆盖真彩检测 |
| `PI_TUI_ESC_TIMEOUT` | 单独一个 ESC 之后等待多久才当作 Escape 键，单位毫秒；经 SSH 时默认 `100`，其他情况默认 `10`。若 Alt 键输入被误读为 Escape，可调大 |
| `VISUAL`, `EDITOR` | `externalEditor` 未设置时的外部编辑器回退 |
| `HTTP_PROXY`, `HTTPS_PROXY` | 为出站 HTTP 请求设置代理 |

`ANTHROPIC_API_KEY`、`OPENAI_API_KEY` 等提供商凭据与提供商专属配置见[提供商](providers.md#use-an-api-key-from-the-environment)。
