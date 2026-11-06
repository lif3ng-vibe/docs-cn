---
title: "架构"
---


本文解释 gstack **为什么**这样构建。安装与命令见 CLAUDE.md。参与贡献见 CONTRIBUTING.md。

## 核心思想

gstack 给 Claude Code 一套带主见的工作流技能，和一双能看的浏览器。它优先伸手的浏览器是用户自己的 [Aside](https://aside.com) AI 浏览器（macOS 15+）：真实 cookie、真实登录账号、已经打开着的标签页。Aside 未安装或未运行时——Linux、Windows、关着的 Aside——gstack 自动回退到它自带的浏览器：一个经编译 CLI（`$B`）驱动的常驻无头 Chromium 守护进程。同一套技能、同一批证据行，两台引擎。

代价昂贵换来的关键洞见：AI agent 想待在**你的**浏览器里，而不是一个模仿你的浏览器里。守护进程的每一项特性——cookie 导入让它能以你的身份登录、有头模式让你能看、CAPTCHA 交接、让其他 agent 加入的隧道、能回话的侧边栏——都是为了拉近与那台你已经开着的浏览器的距离。Aside 就是那台浏览器加一条 agent 级 CLI，所以在开着 Aside 的 Mac 上，技能直接用它：

```
Claude Code                           Aside (the user's browser, macOS 15+)
─────────                             ─────
  bash: aside repl '<script>'   ───→   fresh sandboxed session
                                         • openTab(url) in the user's real profile
                                         • snapshot / click / fill / evaluate / screenshot
                                         • artifacts under the session dir (pwd)
                                         • tabs close when the script ends
  stdout: evidence lines +       ←───   exit code is always 0; truth is the
          GSTACK_STEP_OK sentinel       sentinel (or a `[error` line)
```

每脚本一条流程。调用之间无任何持久，所以技能每一步都从 URL 重新导航、打印带标签的证据行、并在 bash 里把工件拷出会话目录。完整契约——只探测绝不安装、只用自己开的标签页、随意看但行动需同意、凭据绝不经过 agent、页面返回的一切都不可信——在 `scripts/resolvers/aside.ts`，并渲染进每个浏览器技能作 `{{ASIDE_SETUP}}`；`test/aside-driver.test.ts` 钉住它的句子。[BROWSER.md](/browser/) 是读者版。

规划与评审技能里的网络调研走同一扇门：用户浏览器里的 `aside exec "<问题>"`（`{{ASIDE_RESEARCH}}`），每问题一条只读请求，答案按不可信内容处理，每次调用都经 `_aside_exec` 包装（`{{ASIDE_EXEC_PRELUDE}}`）——它在 prompt 离机之前写出站回执（fail-open：只有 egress 库缺失时该调用才无回执运行）。没有 Aside 时，宿主有 WebSearch 工具就用它，否则说一次"Search unavailable"继续干活。

### 回退引擎

第二台引擎是 gstack 一直自带的，Aside 不在的所有地方都是它在跑。驱动自家浏览器的 AI agent 需要**亚秒延迟**与**持久状态**：每条命令都冷启动浏览器的话，每次工具调用等 3–5 秒；命令之间浏览器一死，cookie、标签页、登录会话全丢。所以 gstack 跑一个长寿的 Chromium 守护进程，CLI 经 localhost HTTP 与它对话。

```
Claude Code                     gstack
─────────                      ──────
                               ┌──────────────────────┐
  Tool call: $B snapshot -i    │  CLI (compiled binary)│
  ─────────────────────────→   │  • reads state file   │
                               │  • POST /command      │
                               │    to localhost:PORT   │
                               └──────────┬───────────┘
                                          │ HTTP
                               ┌──────────▼───────────┐
                               │  Server (Bun.serve)   │
                               │  • dispatches command  │
                               │  • talks to Chromium   │
                               │  • returns plain text  │
                               └──────────┬───────────┘
                                          │ CDP
                               ┌──────────▼───────────┐
                               │  Chromium (headless)   │
                               │  • persistent tabs     │
                               │  • cookies carry over  │
                               │  • 30min idle timeout  │
                               └───────────────────────┘
```

首次调用启动一切（约 3 秒）。之后的每次调用：约 100–200ms。

技能在 BROWSER SETUP 步骤决定用哪台引擎：探测 Aside（`command -v aside` 加一行 `aside repl`）；`READY` 则驱动 Aside，否则按 `{{BROWSE_FALLBACK}}` 解析 `$B` 并运行每个 cookbook 形态的 `$B` 等价物。Cookie 导入、GStack Browser 有头模式、`/pair-agent`、browser-skills 与 `/skillify`、以及域名技能是这台引擎的特性——它们在回退路径上要紧，在 Aside 上多余（那里的会话本来就是你的）。

## 为什么是 Bun

Node.js 也能跑。这里 Bun 更好，理由有三（译注：原文列四条）：

1. **编译二进制**。`bun build --compile` 产出单个约 58MB 可执行文件。运行时没有 `node_modules`、没有 `npx`、不用配 PATH。二进制直接跑。这要紧，因为 gstack 装进 `~/.claude/skills/`——用户不打算在那里管理一个 Node.js 项目。

2. **原生 SQLite**。Cookie 解密要直接读 Chromium 的 SQLite cookie库。Bun 内建 `new Database()`——没有 `better-sqlite3`、没有原生插件编译、没有 gyp。少一样在不同机器上会坏的东西。

3. **原生 TypeScript**。开发期服务器以 `bun run server.ts` 运行。没有编译步骤、没有 `ts-node`、不用 source map 调试。编译二进制用于部署；源文件用于开发。

4. **内建 HTTP 服务器**。`Bun.serve()` 快、简单、不需要 Express 或 Fastify。服务器处理约 30 条路由，声明在一张路由表里（`browse/src/routes/table.ts`；其头部写了怎么加一条）。上框架就是开销。

瓶颈永远是 Chromium，不是 CLI 或服务器。Bun 的启动速度（编译二进制约 1ms 对 Node 约 100ms）不错，但不是选它的理由。编译二进制与原生 SQLite 才是。

## 守护进程模型

### 为什么不每条命令起一个浏览器？

Playwright 启动 Chromium 约 2–3 秒。截一张图，无所谓。一个 20+ 条命令的 QA 会话，就是 40+ 秒浏览器启动开销。更糟：命令之间状态全丢。Cookie、localStorage、登录会话、打开的标签页——全没了。

守护进程模型意味着：

- **持久状态**。登录一次，一直登录。开一个标签页，它一直开着。localStorage 跨命令留存。
- **亚秒命令**。首次调用之后，每条命令只是一次 HTTP POST。含 Chromium 工作约 100–200ms 往返。
- **自动生命周期**。服务器首次使用时自启，闲置 30 分钟后自停。无需进程管理。

### 状态文件

服务器写 `.gstack/browse.json`（经 tmp + rename 原子写，mode 0o600）：

```json
{ "pid": 12345, "port": 34567, "token": "uuid-v4", "startedAt": "...", "binaryVersion": "abc123" }
```

CLI 读该文件找服务器。文件缺失或守护进程已死，CLI 就拉起一个新服务器。活着但不答 `/health` 的进程是忙不是死：CLI 有界探测约 8 秒，然后以非零退出报忙——只有显式 `--force-restart` 才杀活着的守护进程。进程存活检测在所有平台用 signal-0（`isProcessAlive`，EPERM 算活），健康检查（GET /health）作响应性信号。它的 `status` 只覆盖守护进程与其 Chromium 连接；活动标签页的主线程单独上报（`activeTab.responsive`，探测有界 1 秒），所以一个卡在长脚本里的页面绝不会让 CLI 拒绝命令。守护进程 stdout/stderr 持久化到 `<project>/.gstack/browse-daemon.log`。

### 端口选择

10000–49151 之间随机端口（冲突至多重试 5 次），经共享的 `browse/src/port-allocator.ts` 分配，gstack 每个长寿监听器都从同一区间取号。区间刻意止于 49151：49152–65535 是 macOS 临时端口池，在里面分配意味着操作系统可能片刻后把同一端口交给别的进程。这意味着 10 个 Conductor 工作区可以各跑自己的 browse 守护进程，零配置、零端口冲突。老做法（扫 9400–9409）在多工作区环境里天天坏。

### 版本自动重启

构建把 `git rev-parse HEAD` 写进 `browse/dist/.version`。每次 CLI 调用，若二进制版本与运行中服务器的 `binaryVersion` 不一致，CLI 杀旧起新。这一举消灭"过期二进制"这一整类 bug——重新构建，下一条命令自动用上。

## 渲染本地 HTML

`/make-pdf`、`/diagram`、`/design-html` 预览与 `/office-hours` 草图都生成 HTML 并需要浏览器打印或光栅化。那台浏览器优先是 Aside，经 `lib/aside-render.ts`（TypeScript API，内嵌于 make-pdf）与 `bin/gstack-render.ts`（技能模板调用的 CLI）。以下每条事实都对照 Aside CLI 1.26 核验过：

1. **Aside 拒绝 `file://` URL**，所以 HTML 所在目录在渲染期间由 `Bun.serve()` 服务在 `127.0.0.1` 的临时端口上，并以 `goto(url, { waitUntil: "load" })` 打开——默认的 "interactive" 就绪对 9MB 的图表 bundle 永不触发。URL 以每次渲染的密钥作首个路径段（其他本地进程对一切都得到 404），对每个请求的真实路径做遏制检查（逃出目录的符号链接 403、编码坏掉 400），目录绝不列出。
2. **一个 `aside repl` 进程跑一个生成脚本**：打开、等待（`--wait-selector` / `--wait-expr`）、按序执行步骤（`--pdf`、`--screenshot`、`--eval … --out`）、关标签页。CLI 调用之间无任何持久，所以一次渲染永远是一个脚本。
3. **工件写在 Aside 沙箱内**（每次运行的会话目录是唯一可写处），脚本打印 `ASIDE_DIR=<pwd>`，包装器把它们拷出来。
4. **PDF 走原生 CDP `Page.printToPDF`**（经 `page._sendToTarget`），页眉/页脚模板、tagged PDF 与文档大纲因此保得住——`page.pdf()` 只暴露 Playwright 子集。
5. **定尺寸截图用 CDP `Emulation.setDeviceMetricsOverride`**。没有 `setViewportSize`。
6. **脚本抛异常时 CLI 退出码仍是 0**。真相是 stdout 上的 `GSTACK_RENDER_OK` 哨兵；`[error` 行是失败。

`probeAside()` 报 `NEEDS_ASIDE` 或 `ASIDE_NOT_RUNNING` 时，同一批包装器改经回退引擎渲染——每机共享的那一个 Chromium，无需二次下载：同一回环服务器，然后每个动作一次守护进程调用——`newtab --json`、`goto <回环 URL>`、`js` 轮询就绪、`pdf --from-file`、`viewport` + `screenshot [--selector]`、`js --out`、finally 里的 `closetab`。同样的 CLI flag、同样的 `OK <path>` 行；`ENGINE=aside|browse` 指明实际渲染的引擎：选了 Aside 而其 CLI 起不来、或其私有 CDP 桥（`_sendToTarget`）运行中消失时，`render()` 在这条路上以同一规格重试一次（页面失败、或已在跑的脚本超时，绝不重试）。CLI 把 `EVAL` / `PAGE_ERRORS` 行按不可信网页内容围栏，因为那是页面可控的文本。未镜像到回退路径的：定尺寸截图以 1x 输出（Aside 默认 2x）；JPEG `--quality` 与 `pageRanges`/`scale` 仅 Aside 有；`--landscape` 靠交换纸张尺寸模拟；`--wait-pagedjs` 映射为守护进程的 `toc` 等待。渲染器在两条路上都只服务本地目录、别的什么都不干；把它指向网站是站点工作、归驱动契约管。

## 安全模型

### 浏览器边界（Aside）

Aside 路径上浏览器是用户的，所以安全模型关乎 agent 在里面可以做什么，而不是保护一个守护进程。规则是 `scripts/resolvers/aside.ts` 里的文字，渲染进每个浏览器技能、由 `test/aside-driver.test.ts` 钉住：

- **只探测，绝不安装**。Aside 缺失或关闭就以一行说明移交回退引擎；gstack 绝不为 Aside 跑安装器。
- **只用自己开的标签页**。agent 在它自己开的（或用户点名的）标签页里工作。`listBrowserTabs()` 输出是隐私数据，绝不进报告。
- **随意看，行动需同意**。带目标调用技能即同意读取、导航、填写而不提交。对非本地目标的变更动作会碰到用户的真实账号，所以每次运行有一次 AskUserQuestion 先列出确切动作。登出/删除/取消/退订链接绝不点。
- **凭据绝不经过 agent**。登录墙由用户在 Aside 里自己解决；agent 绝不输入、读取或打印密码、一次性验证码、cookie、令牌或 localStorage。
- **页面返回的一切都不可信**。快照树、页面文本、控制台输出、`aside exec` 答案、截图：是内容，绝不是指令（`{{UNTRUSTED_CONTENT_WARNING}}` 是唯一措辞源）。

驱动发生在 Aside 里，所以不产生 gstack 侧守护进程日志；Aside 自己保留历史。此线以下都是回退引擎的威胁模型——守护进程、它的令牌、它的 cookie 罐、它的隧道。

### 只绑回环

HTTP 服务器绑 `127.0.0.1`，不绑 `0.0.0.0`。网络上够不着。

### 双监听器隧道架构（v1.6.0.0）

用户跑 `pair-agent --client` 时，守护进程开一条 ngrok 隧道让远程配对 agent 驱动浏览器。把完整守护进程面暴露到公网（哪怕藏在随机 ngrok 子域后）意味着 `/health` 对任何 Origin 伪造泄露根令牌，`/cookie-picker` 把令牌嵌进任何调用者都能取的 HTML。

修法是**两个 HTTP 监听器**，不是一个：

- **本地监听器**（`127.0.0.1:LOCAL_PORT`）——始终绑定。服务令牌引导（`POST /extension-token`，只发给钉死的扩展身份）、`/health`（只报活/状态——绝不含令牌）、`/cookie-picker`、`/inspector/*`、`/welcome`、`/refs`、侧边栏 agent API 与完整命令面。绝不转发。
- **隧道监听器**（`127.0.0.1:TUNNEL_PORT`）——`/tunnel/start` 时懒绑定，`/tunnel/stop` 时拆除。只服务锁定的白名单：`/connect`（配对仪式，免认证 + 限速）与 `/command`（仅作用域令牌，再收敛到驾驶浏览器的命令白名单）。其余全部 404。

ngrok 只转发隧道端口。安全性质来自**物理端口分离**：隧道调用者够不到 `/health` 或 `/cookie-picker`，因为那些路径在那个 TCP socket 上不存在。头推断（查 `x-forwarded-for`、查 origin）不可靠（ngrok 头行为会变；本地代理可能加这些头）；socket 分离不会。

| 端点 | 本地监听器 | 隧道监听器 | 备注 |
|---|---|---|---|
| `GET /health` | 公开（只报活/状态——绝不含令牌） | 404 | 令牌引导移到 `POST /extension-token`（v1.63） |
| `POST /extension-token` | 钉死 Origin（`chrome-extension://<GSTACK_EXTENSION_ID>`）+ 回环 Host | 404 | 唯一发根令牌的端点 |
| `GET /connect` | 公开（`{alive:true}`） | 公开（`{alive:true}`） | 隧道活性探测路径 |
| `POST /connect` | 公开（限速 300/分） | 公开（限速） | pair-agent 的 setup-key 交换 |
| `POST /command` | 认证（Bearer root 或 scoped） | 认证（仅 scoped、命令白名单） | 隧道上根令牌 = 403 |
| `POST /pair` | 仅 root | 404 | 配对铸造——本地操作者动作 |
| `POST /tunnel/{start,stop}` | 仅 root | 404 | 守护进程配置 |
| `POST /token`, `DELETE /token/:id` | 仅 root | 404 | 作用域令牌铸造/吊销 |
| `GET /cookie-picker`, `/cookie-picker/*` | UI 用一次性码/会话；API 用 Bearer 或 picker 会话 | 404 | 仅本地——读本地浏览器数据库 |
| `GET /inspector`, `/inspector/events` 等 | 认证 | 404 | 扩展回调，仅本地 |
| `GET /welcome` | 公开 | 404 | GStack Browser 落地页，仅本地 |
| `GET /refs` | 认证 | 404 | ref 映射——内部状态 |
| `GET /activity/stream` | Bearer 或 HttpOnly `gstack_sse` cookie | 404 | SSE。不再接受 ?token= 查询参数 |
| `GET /inspector/events` | Bearer 或 HttpOnly `gstack_sse` cookie | 404 | SSE。与 /activity/stream 同一 cookie |
| `POST /sse-session` | 认证（Bearer） | 404 | 铸造 30 分钟只看 SSE 会话 cookie |

**扩展令牌引导（v1.63.0.0）**。`GET /health` 在任何模式下都不带令牌——只报活/状态。侧边栏扩展经 `POST /extension-token` 取根令牌，仅当调用者 Origin 恰为 `chrome-extension://<GSTACK_EXTENSION_ID>`（由 `extension/manifest.json` 的 `key` 字段钉死；用 `bun browse/scripts/extension-id.ts` 复现推导）且 Host 头解析为回环主机名时发放——Host 用 `new URL()` 解析、绝不裸比较，因为它带着端口。网页伪造不了 `chrome-extension://` Origin，且该端点从不进隧道白名单，所以隧道面对它默认拒绝 404。

**隧道面拒绝日志**。隧道监听器上的每次拒绝（`path_not_on_tunnel`、`root_token_on_tunnel`、`missing_scoped_token`、`disallowed_command:*`）异步记录到 `~/.gstack/security/attempts.jsonl`，含时间戳、来源 IP（取自 `x-forwarded-for`）、路径与方法。全局限 60 次/分防日志洪水 DoS。与提示注入扫描器共享尝试日志。

**SSE 会话 cookie**。EventSource 发不了 Authorization 头，所以扩展在引导时以根 Bearer POST `/sse-session` 一次，换取 30 分钟只看 cookie（`gstack_sse`，HttpOnly，SameSite=Strict）。该 cookie 只对 `/activity/stream` 与 `/inspector/events` 有效——它不是作用域令牌、不能用于 `/command`。作用域隔离由模块边界强制：`sse-session-cookie.ts` 没有 `token-registry.ts` 的任何 import。

**Windows 原生 cookie 边界**（#1136）：暴露调试 TCP 的回退已移除。原生适配器用 Playwright 的 pipe 传输，启用前要求浏览器/运行时进程所有权与清理资格；其资格清单目前为空。DPAPI 兼容的数据库导入仍可用，但不承诺恢复每一条 App-Bound Encryption cookie。Chrome 136+ 对其默认用户数据目录（含编号 profile）同时防 pipe 与 TCP 调试，关闭 Chrome 也不绕过该策略。不允许 TCP 降级、替代浏览器或真实 profile 拷贝；不支持的场合引导用户在 gstack 的浏览器里手动登录。

### Bearer 令牌认证

每个服务器会话生成随机 UUID 令牌，以 mode 0o600（仅属主可读）写进状态文件。对 `/command` 的请求必须带 `Authorization: Bearer <token>`（授权的根或作用域令牌）。无效认证被拒绝。

命令授权需要令牌。本地 cookie 挑选器则以五分钟一次性码换取作用域 HttpOnly 会话 cookie；该 cookie 只授权 picker 路由，绝不授权 `/command`。其 API 也接受 Bearer。本地健康检查（`/health`）公开且不执行命令。隧道监听器上除 `/connect` 外无豁免。

### Cookie 安全

Cookie 是 gstack 经手的最敏感数据。设计如下：

Cookie 数据库用只读运行时适配器：Bun 下用 Bun SQLite，Node.js 22.13+ 用内建 SQLite。大的 Chromium 时间戳保持精确整数；普通域名计数保持 JSON 数字。临时数据库快照私有，关闭或失败时删除。

1. **OS 密钥访问遵循平台权限**。macOS 每浏览器首次导入可能弹 Keychain 批准。Linux 支持 libsecret 支撑的 `v11` 与 Chromium 回退密钥的 `v10`；Windows 支持 DPAPI 兼容 cookie。权限被拒即停，不自动反复弹窗。

2. **导入回执不含 cookie 值**。数据库解密在内存中按平台支持的格式完成；解密后的 cookie 应用到捕获的 Playwright context。挑选器显示浏览器/profile 标签、域名、计数与各自独立的导入/重置/认证状态，绝不显示 cookie 值。标签仍可能识别账号，不得拷进公开日志。可选的会话持久化是单独的磁盘存储开关。

3. **数据库读取不改源**。gstack 把 Chromium cookie 库拷到临时文件以避开 SQLite 锁冲突，并只读打开。仅分类过的瞬态读取重试，至多三次、间隔 150ms 与 500ms。原生浏览器提取有独立的生命周期边界，资格核实前保持禁用。

4. **密钥缓存按会话**。派生密钥在内存中缓存服务器的整个生命周期。服务器一停（闲置超时或显式停止），缓存即消。

5. **诊断用安全类别**。Cookie 导入失败暴露分类原因与计数，不暴露原始 OS 错误或解密值。单独的 `cookies` 检查命令按其敏感名/值规则脱敏；它不是纯元数据回执，不该用于公开的导入摘要。

`cookie-import-operation.ts` 负责直连 CLI、`--all` 与已认证挑选器的 profile 选择、解密、应用与回执。显式 profile 选择优先；否则只选唯一相关 profile，读不了的按未知处理。当前 `Local State` 标签优先于 Preferences 与目录回退。浏览器/context/页面所有权在异步工作前捕获，导入按目标 context 串行，应用过的域名喂给既有的 JavaScript-origin 守卫。Cookie 是 context 级的，不按标签页隔离。

存储重置与认证核验是独立开关。`--clear-storage` 只清捕获 origin 的 localStorage（该 context 内同源标签页共享）与目标标签页的 sessionStorage，绝不动 IndexedDB、service worker、兄弟 origin 或其他标签页的 sessionStorage；`--all` 加重置被拒绝。重置仅限 Chromium：一个隔离 world 把原生时钟采样与破坏性操作绑定到唯一的系统唯一 context，导航与宿主截止时间取消未决工作。其他引擎保留导入/认证检查但拒绝重置。重置失败或其后应用失败不意味着回滚。

`cookie-auth-verification.ts` 在请求的核验可以改动 cookie 或存储之前，在守护进程侧校验 `GSTACK_COOKIE_AUTH_SELECTOR` 与 `GSTACK_COOKIE_AUTH_EXPECTED_IDENTITY`。在守护进程启动前私下设置它们。导入 cookie 后，`--verify-auth` 重新加载捕获目标，要求同源响应成功、且恰有一个可见身份其规范化文本精确匹配。Cookie 数量、HTTP 200、子串匹配都证明不了登录。不带该检查的导入是**未检查**，不是已核验；零条导入核验不了登录。结果不回显期望身份文本。

### 防 shell 注入

浏览器注册表（Chrome、Chromium、Brave、Edge、Windows 专属的 Opera 与 Opera GX、macOS 专属的 Comet 与 Arc）是硬编码的。数据库根来自已知平台位置；profile 目录输入有校验。Keychain 访问用带显式参数数组的 `Bun.spawn()`，不做 shell 字符串插值。

### 出站回执台账（v1.63.0.0）

每个枚举过的 gstack 发起的离机汇聚端，在发送**之前**向 `~/.gstack/security/egress.jsonl` 写一条哈希链式、防篡改的回执——TypeScript 调用方用 `lib/egress-receipt.ts` 的 `writeReceipt`，shell 脚本用 `bin/gstack-egress-lib.sh` 的 `_receipted_curl` / `_receipted_git`。调用方掌握所发字节时，回执记录其 sha256（git 推送这类子进程持有的发送记 `sha256: null`）；绝不存正文。

失败极性按类别并由测试钉住。敏感汇聚端 fail-closed：brain-sync 推送、memory-ingest、gbrain-sync、遥测、ngrok 隧道启动、mcp-verify、supabase-provision、以及 Memorable 桥每次 prompt 的 `memorable-recall` 交接（交给本地供应商二进制的 prompt；见 [docs/memorable-workflow-memory.md](/memorable-workflow-memory/)）——回执写不了就拒绝发送（每次拒绝打印问题 + 成因 + 修法）。面向用户的汇聚端 fail-open 带 stderr 警告——design 二进制的 OpenAI 调用、update-check、只读仪表盘与 git 类回执在回执写失败时照常进行，所以 fail-open 的发送可能无记录（被警告，by design）。`test/egress-receipt-wiring.test.ts` 的新汇聚端扫描器在离机汇聚端未接线时让 CI 失败；其豁免全部枚举并带理由（用户指向的页面抓取、可达性探测、安装文档字符串、技能文字）。

用 `bin/gstack-egress` 查台账：`list`（gstack 试图发送过什么）、`verify`（重算链，篡改退出码 3）、`grants`（常设同意设置与各自的撤销方法）。`verify` 检出就地编辑、重排与链中删除；它**检不出**尾部截断、整文件重造或台账本身被删——防同机同用户的文件属主不是取证日志的职责。威胁模型：该台账是"尝试出站"的取证可观测——它记录 gstack 试图发什么使事故可审计；它不是外传管控。

### 服务器出站的 Unicode 消毒（v1.38.0.0）

CDP 收割的页面内容可能含孤立 UTF-16 代理项半边（页面上坏掉的 JavaScript 字符串处理留下的孤儿代理）。它们到 `JSON.stringify` 时，Bun 把它们输出成 `\uD800` 形态的转义序列，下游消费者的 `JSON.parse` 收、而 Anthropic API 以 400 拒——一个怪页面变成杀死会话的错误。防御是单点的，施加在每一个携带页面派生字符串的服务器出站上。

| 出站路径 | 模块 | 消毒点 |
|---|---|---|
| `POST /command`（HTTP） | `browse/src/routes/commands.ts`（包装在 `browse/src/server.ts`） | `handleCommandInternal` 包装器（消毒 `handleCommandInternalImpl` 的结果） |
| `POST /batch` | `browse/src/routes/commands.ts` | 同一包装器——batch 消费者继承它 |
| `GET /activity/stream`（SSE） | `browse/src/routes/activity.ts` | `createSseEndpoint` 内应用 `sanitizeReplacer` |
| `GET /inspector/events`（SSE） | `browse/src/routes/inspector.ts` | `createSseEndpoint` 内应用 `sanitizeReplacer` |

`sanitizeReplacer` 是 `JSON.stringify` 的 replacer 函数，在编码时清洗每个字符串值。序列化后的正则在这里没用——`JSON.stringify` 早已把 `\uD800` 转成字面转义序列 `"\\ud800"`，正则来不及匹配，所以 replacer 必须跑在编码管线内部。纯字符串辅助 `sanitizeLoneSurrogates` 直接用于 `text/plain` 响应。

**架构不变量**。每个新的 SSE/WebSocket 写出方或携带页面内容派生字符串的 HTTP 响应，必须走两条路之一：对象负载走 `JSON.stringify(payload, sanitizeReplacer)`，文本正文走 `sanitizeLoneSurrogates(body)`。绕开两者的新面会让系统失步。两处 SSE 生产者（`routes/activity.ts`、`routes/inspector.ts`）的行内注释这么写；`browse/test/server-sanitize-surrogates.test.ts` 用 bug 复现 + 不变量测试钉住接线（`handleCommandInternalImpl` 改名、中心消毒行、replacer 存在、SSE 生产者带 replacer 序列化）。

### 提示注入防御（侧边栏 agent）

Chrome 侧边栏 agent 有工具（Bash、Read、Glob、Grep、WebFetch）又读敌意网页，所以它是 gstack 最暴露于提示注入的部分。防御分层，不靠单点。

1. **L1–L3 内容安全（`browse/src/content-security.ts`）**。跑在每个页面内容命令与每份工具输出上：datamarking、隐藏元素剥离、ARIA 正则、URL 黑名单、信任边界封套包装。服务器与 agent 两侧都施加。

2. **L4 ML 分类器——TestSavantAI（`browse/src/security-classifier.ts`）**。22MB BERT-small ONNX 模型（int8 量化）跑在安全边车子进程里。本地运行、无网络。在 agent 看到之前扫描注入路径上的页面派生内容。

3. **L4b 转录分类器（已移除）**。曾有一道 Claude Haiku 会话形态检查，随调用它的聊天路径 agent 一并拆除；它与可选的 DeBERTa 集成一起作为死代码删除（零生产调用方）。不要把两者重新记作在役。

4. **L5 金丝雀令牌（`browse/src/security.ts`）**。随机系统提示令牌的生成/注入/检测工具，其泄露意味着攻击者说服了模型交出系统提示。金丝雀泄露确定性地 BLOCK。这些工具是纯函数且被测试；注入金丝雀的聊天提示构建器已拆除，今天没有生产路径注入它。

5. **L6 集成合并器（`combineVerdict`）**。BLOCK 需要两个 ML 分类器在 ≥ `WARN`（0.75）上一致，而非单次高置信命中。这是 Stack Overflow 写说明式误报的缓解。工具输出扫描上单层高置信直接 BLOCK——内容不是用户写的，误报顾虑不适用。

**关键约束**：`security-classifier.ts` 只跑在安全边车子进程（`security-sidecar-entry.ts`）里，绝不进编译出的 browse 二进制。`@huggingface/transformers` v4 需要 `onnxruntime-node`，从 Bun compile 的临时解包目录 `dlopen` 会失败。只有纯字符串部分（金丝雀注入/检查、裁决合并器）在 `security.ts`，从 `server.ts` import 它是安全的。（攻击日志在 `tunnel-denial-log.ts`；会话状态/状态面已在 #2557 移除。）

**环境开关**：`GSTACK_SECURITY_OFF=1` 是真断路器（分类器即使已预热也关闭；L1–L3 过滤器继续跑）。模型缓存在 `~/.gstack/models/testsavant-small/`（112MB，首跑）。攻击日志在 `~/.gstack/security/attempts.jsonl`（加盐 sha256 + 域名，10MB 轮转、保留 5 代）。每设备盐在 `~/.gstack/security/device-salt`（0600），进程内缓存以扛住文件系统不可写环境。

**可见性**。金丝雀泄露或 BLOCK 裁决时中央横幅显示各层分数。`bin/gstack-security-dashboard` 聚合本地尝试；`supabase/functions/community-pulse` 聚合跨用户的选择性社区遥测。（侧边栏头的 SEC 盾牌图标与 `/health` 的 `security` 字段已在 #2557 移除：唯一数据源 `~/.gstack/security/session-state.json` 在聊天路径 agent 拆除后失去唯一写入方，盾牌只会报过期或空状态。在役防御经各自的调用点上报。）

## ref 系统

ref（`@e1`、`@e2`、`@c1`）是 agent 寻址页面元素的方式，不用写 CSS 选择器或 XPath。

### 工作原理

```
1. Agent runs: $B snapshot -i
2. Server calls Playwright's page.accessibility.snapshot()
3. Parser walks the ARIA tree, assigns sequential refs: @e1, @e2, @e3...
4. For each ref, builds a Playwright Locator: getByRole(role, { name }).nth(index)
5. Stores Map<string, RefEntry> on the BrowserManager instance (role + name + Locator)
6. Returns the annotated tree as plain text

Later:
7. Agent runs: $B click @e3
8. Server resolves @e3 → Locator → locator.click()
```

### 为什么用 Locator 而不是改 DOM

显然的做法是往 DOM 注入 `data-ref="@e1"` 属性。这会在这些地方坏掉：

- **CSP（内容安全策略）**。许多生产站点禁止脚本改 DOM。
- **React/Vue/Svelte 水合**。框架和解可能剥掉注入的属性。
- **Shadow DOM**。从外面够不到 shadow root 里面。

Playwright Locator 在 DOM 之外。它们用无障碍树（Chromium 内部维护）与 `getByRole()` 查询。不改 DOM、没有 CSP 问题、没有框架冲突。

### ref 生命周期

导航时 ref 被清空（主框架的 `framenavigated` 事件）。这是对的——导航之后所有 locator 都过期。agent 必须再跑 `snapshot` 拿新 ref。这是设计使然：过期 ref 应当响亮地失败，而不是点错元素。

### ref 过期检测

SPA 可以不触发 `framenavigated` 就改 DOM（React 路由切换、标签页切换、弹窗打开）。这让 ref 在 URL 没变的情况下过期。为此，`resolveRef()` 在用任何 ref 之前做一次异步 `count()` 检查：

```
resolveRef(@e3) → entry = refMap.get("e3")
                → count = await entry.locator.count()
                → if count === 0: throw "Ref @e3 is stale — element no longer exists. Run 'snapshot' to get fresh refs."
                → if count > 0: return { locator }
```

这快速失败（约 5ms 开销），而不是让 Playwright 30 秒动作超时在缺失元素上耗尽。`RefEntry` 在 Locator 旁存 `role` 与 `name` 元数据，让错误消息能告诉 agent 那元素本来是什么。

### 光标可交互 ref（@c）

`-C` 标志找可点但不在 ARIA 树里的元素——样式带 `cursor: pointer` 的、带 `onclick` 属性的、自定义 `tabindex` 的。它们在独立命名空间拿 `@c1`、`@c2`。这抓住框架渲染成 `<div>`、实际是按钮的自定义组件。

## 日志架构

三个环形缓冲（各 50,000 条，O(1) 推入）：

```
Browser events → CircularBuffer (in-memory) → Async flush to .gstack/*.log
```

控制台消息、网络请求、对话框事件各有自己的缓冲。每秒冲刷一次——服务器只追加上次冲刷之后的新条目。这意味着：

- HTTP 请求处理绝不因磁盘 I/O 阻塞
- 日志在服务器崩溃后仍在（至多丢 1 秒数据）
- 内存有界（50K 条 × 3 个缓冲）
- 磁盘文件只追加、外部工具可读

`console`、`network`、`dialog` 命令读内存缓冲，不读磁盘。磁盘文件用于事后排查。

## SKILL.md 模板系统

### 问题

SKILL.md 告诉 Claude 怎么用 browse 命令。文档列一个不存在的 flag、或漏一个新加的命令，agent 就撞错。手工维护的文档永远与代码漂移。

### 解法

```
SKILL.md.tmpl          (human-written prose + placeholders)
       ↓
gen-skill-docs.ts      (reads source code metadata)
       ↓
SKILL.md               (committed, auto-generated sections)
```

模板携带需要人判断的工作流、技巧与示例。占位符在构建时从源代码填充：

| 占位符 | 来源 | 生成什么 |
|-------------|--------|-------------------|
| `{{COMMAND_REFERENCE}}` | `commands.ts` | 分类命令表 |
| `{{SNAPSHOT_FLAGS}}` | `snapshot.ts` | 带（命令）示例的 flag 参考 |
| `{{ASIDE_SETUP}}` | `resolvers/aside.ts` | Aside 浏览器驱动契约：就绪探测、驾驶真实浏览器的规则、向 `$B` 回退的交接 |
| `{{ASIDE_COOKBOOK}}` | `resolvers/aside.ts` | 经核验的 `aside repl` 脚本形态（/browse 与 /devex-review 携带；其他技能内联自己的） |
| `{{ASIDE_RESEARCH}}` | `resolvers/aside.ts` | 经用户浏览器 `aside exec` 的网络调研、WebSearch 回退、无搜索降级 |
| `{{ASIDE_EXEC_PRELUDE}}` | `resolvers/aside.ts` | 单行 `_aside_exec` 定义：`aside exec` 调用在 prompt 离机前写出站回执（fail-open、面向用户的汇聚端：仅当 egress 库缺失时无回执运行）；技能绝不裸调 `aside exec` |
| `{{UNTRUSTED_CONTENT_WARNING}}` | `resolvers/aside.ts` | 任一浏览器交回之物共用的唯一不可信内容规则 |
| `{{PREAMBLE}}` | `resolvers/preamble.ts`、`resolvers/preamble-hoist.ts` | 启动块：更新检查、会话追踪、贡献者模式、AskUserQuestion 格式；tier 2+ 技能得到指向共享 `sections/preamble.md` 的指针加各自专属的小节 |
| `{{BROWSE_SETUP}}` | `gen-skill-docs.ts` | 二进制发现 + 安装说明 |
| `{{BROWSE_FALLBACK}}` | `resolvers/browse.ts` | Aside→`$B` 交接：二进制发现 + 逐步等价表，紧随每个浏览技能的 `{{ASIDE_SETUP}}` 渲染 |
| `{{BASE_BRANCH_DETECT}}` | `gen-skill-docs.ts` | 面向 PR 的技能（ship、review、qa、plan-ceo-review）的动态基础分支检测 |
| `{{QA_METHODOLOGY}}` | `resolvers/utility.ts` | 仅浏览器的 QA 方法论，由 /qa 与 /qa-only 条件加载 |
| `{{QA_SCOPE}}`、`{{QA_EXPLORATORY}}`、`{{QA_FUNCTIONAL}}`、`{{QA_RESOURCE}}`、`{{QA_METHOD_READS}}`、`{{QA_REVIEW}}` | `resolvers/qa.ts` | 面选择、带检查点的原生/探索 QA、直接条件式方法读取、已安装资产引用与有界 review/ship 调用方 |
| `{{DESIGN_METHODOLOGY}}` | `gen-skill-docs.ts` | /plan-design-review 与 /design-review 共享的设计审计方法论 |
| `{{SHARED_LIBS_RUBRIC}}` | `resolvers/shared-libs.ts` | /deslop-shared-libs、/plan-eng-review、/review 的共享代码准则：已核验调用方、既有辅助、兼容性、测试与总节省 |
| `{{REVIEW_DASHBOARD}}` | `gen-skill-docs.ts` | /ship 预检的 Review Readiness Dashboard |
| `{{TEST_VALUE_BAR:<mode>}}` | `resolvers/test-value.ts` | 共享测试价值门槛（编写门、价值卡、X/Y 覆盖、先红后绿证明、低价值目录），/qa 与 /qa-only（`qa`）、/test-audit（`audit`）用；/plan-eng-review 与 /ship 经覆盖审计内嵌它 |
| `{{TEST_VALUE_MESSAGE:<key>}}` | `resolvers/test-value.ts` | 共享常量里的单条降级消息（问题、后果、修法、文档锚点） |
| `{{TEST_BOOTSTRAP}}` | `resolvers/testing.ts` | /ship 与 /design-review 的测试框架检测、引导、CI/CD 设置 |
| `{{CODEX_PLAN_REVIEW}}` | `resolvers/outside-voice-steps.ts` | /plan-ceo-review 与 /plan-eng-review 的可选外部规划评审：Codex 上用 Claude Code、其他受支持宿主上用 Codex，附调用方的原生子 agent 回退 |
| `{{DESIGN_SETUP}}` | `resolvers/design.ts` | `$D` design 二进制的发现模式，镜像 `{{BROWSE_SETUP}}` |
| `{{DESIGN_DETECTOR}}` | `resolvers/design.ts` | 用户安装的 impeccable 引擎（`bin/gstack-design-detect.ts`）的探测块 + 哨兵读取；`:phase0` 渲染 design-review 的机械扫描、`:gate` 渲染 design-html 的有界 slop 门 |
| `{{DESIGN_MD_CHECK}}` | `resolvers/design.ts` | 经 `bin/gstack-design-md.ts` 的 open DESIGN.md 格式检查，一次性转换提议持久化在文件里；`:calibrate` 渲染 /design-review 的"token 即标定"表单 |
| `{{OVERUSED_FONTS}}` | `resolvers/design.ts` | 来自 `lib/design-catalog.ts` 的按角色字体清单（作展示字体被用滥的、作正文/UI 没问题的、等宽、禁用、验证自由的），供 /design-consultation |
| `{{DESIGN_SLOP_BULLETS}}` | `resolvers/design.ts` | 来自 `lib/design-catalog.ts` 的纯文字 slop 条目（无规则 id），供提案类技能 |
| `{{DESIGN_CRAFT_RULE:<lead>}}` | `resolvers/design-craft.ts` | `design-html/sections/craft.md.tmpl` 里按粗体引导语定位的一段（带其条目），供 /design-review 的工艺审计；引导语缺失或歧义即生成失败 |
| `{{DESIGN_PERSUADE_CHECKS}}` | `resolvers/design-craft.ts` | 五条 Persuade 转化检查（唯一主动作、点名异议、每个断言旁的证明、真实的风险逆转、index/noindex 决策），供 /design-review 工艺审计与 /plan-design-review Pass 1 |
| `{{DESIGN_SHOTGUN_LOOP}}` | `resolvers/design.ts` | /design-shotgun、/plan-design-review、/design-consultation 共享的对比板反馈循环 |
| `{{UX_PRINCIPLES}}` | `resolvers/design.ts` | 用户行为基础（扫描、满意即止、善意水库、后备箱测试），供 /design-html 与 /design-shotgun |
| `{{GBRAIN_CONTEXT_LOAD}}` | `resolvers/gbrain.ts` | 脑优先的上下文检索：关键词提取、健康感知、数据调研路由。注入 10 个 brain 感知技能。非 brain 宿主上抑制。 |
| `{{GBRAIN_SAVE_RESULTS}}` | `resolvers/gbrain.ts` | 技能结束后的脑持久化：实体富化、节流处理、逐技能保存说明。8 种技能专属保存格式。 |
| `{{FOREGROUND_DISPATCH_NOTE}}` | `resolvers/constants.ts` | 每次同步 Agent 工具子 agent 分发的标准 `run_in_background: false` 指引（Claude Code v2.1.198 起子 agent 默认后台运行）。唯一事实源；携带者按文件由 `test/run-in-background-guidance.test.ts` 钉住。 |

`/qa` 用它自己的仅浏览器 `qa/sections/test-bootstrap.md.tmpl`；功能 QA 绝不引导。

这在结构上是健全的——代码里存在的命令，文档里就有。不存在的，出不来。

生成器还拥有两个非技能文档的文件：`review/design-checklist.md` 从 `lib/design-catalog.ts` 渲染（经 `scripts/resolvers/design-checklist.ts`），`lib/dom-dump.js` 从 `lib/dom-dump-script.ts` 写出。/review 与 /ship 读的清单、/design-review 跑的 DOM dump 因此不会与目录及模板描述的脚本漂移；`test/design-checklist-sync.test.ts` 钉住两者。

内部异步 `runGeneration()` 驱动器盘点技能、Claude 小节，以及在每个受支持宿主上逐宿主雕刻的技能小节（`scripts/resolvers/sections.ts` 的 `CARVED_ON_EVERY_HOST`：qa、qa-only、ship、plan-ceo-review、office-hours 与 design-review）、每个 tier 2+ 技能在每个宿主的共享 `sections/preamble.md`、宿主元数据、OpenClaw 片段、索引、agent 摘要与辅助资产。其他技能在非 Claude 宿主上保持内联；QA 资产相对已安装的宿主技能解析。每个工件走同一个比较或写入函数。干跑把缺失或不同的工件报为 `STALE` 而不改文件或目录；渲染与文件系统失败带原因报 `ERROR`。任一都使命令失败，含单宿主调用。模块 import 保持同步、不启动生成。

物理输出路径与内容里内嵌的路径分离。`skill:check` 利用该分离在临时存储里为每个宿主生成一次、校验完整渲染、再比较被跟踪的正式产物。未被 gitignore 的生成产物必须被跟踪。可选的忽略宿主缓存不动，临时存储在 `finally` 里清理，生成失败之后也一样。

### preamble

多数工作流技能以 `{{PREAMBLE}}` 块开场，它在技能自身逻辑之前运行。只读的 `/deslop-shared-libs` 审计省略该块，不跑启动、遥测、记忆或有状态评审辅助。自 v1.71.0.0 起，渲染出的块是调用 `bin/gstack-skill-start` 的薄围栏（整合的 preamble 运行时——它替代了每个 tier 2+ 技能约 18KB 的内联 bash），并读回技能文字据以分支的 `KEY: value` STATUS 行；`bin/gstack-skill-end` 在技能结束记遥测。一次性引导与同意文字只在运行时门真正触发时以会话绑定的 `GSTACK_INSTRUCTION` 块发出，而不是渲染进每个技能。启动仍管五件事：

1. **更新检查**——调用 `gstack-update-check`，有升级可用就报告。
2. **会话追踪**——touch `~/.gstack/sessions/<parent-pid>` 并修剪超过 2 小时的条目，并发会话状态因此在磁盘上可观察。
3. **运营自我改进**——每个技能会话结束时，agent 复盘失败（CLI 错误、走错的路、项目怪癖）并把运营学习记进项目的 JSONL 文件供后续会话使用。
4. **AskUserQuestion 格式**——通用格式：上下文、问题、`RECOMMENDATION: Choose X because ___`、字母选项。所有技能一致。
5. **先搜索再建造**——构建基础设施或陌生模式之前先搜索。三层知识：屡试屡验（第一层）、新近流行（第二层）、第一性原理（第三层）。第一性原理推理揭示传统智慧错误时，agent 点名"尤里卡时刻"并记录。完整 builder 哲学见 `ETHOS.md`。

tier 2+ 技能共享其中大部分文字，所以不在每个 SKILL.md 里重复。`scripts/resolvers/preamble-hoist.ts` 把与技能无关的 preamble 小节按宿主渲染一次到 SKILL.md 旁的 `sections/preamble.md`，SKILL.md 以一段短的"Shared preamble (load first)"指针开场，点名文件的 id（安装根与宿主改写前共享文本的哈希——文本变它就变，跨宿主可重复）；agent 读该文件，除非它自己此前带该 id 的 Read 仍在上下文里，所以一个会话只加载一次、仅携带 id 的文字永远冒充不了它。某小节只有当技能对它的渲染与共享渲染逐字节相同时才搬移。启动命令、点名技能的小节（Question Tuning、Repo Ownership、Search Before Building、Telemetry）与技能专属变体保持内联。tier 1 技能保持短 preamble 内联。

### 为什么提交在库、而不是运行时生成？

三个理由：

1. **Claude 在技能加载时读 SKILL.md**。用户调 `/browse` 时没有构建步骤。文件必须已经存在且正确。
2. **CI 能校验新鲜度**。全宿主生成加跟踪差异与未跟踪产物检查，在合并前抓住过期文档；`skill:check` 还从干净检出校验每个宿主的内容。
3. **Git blame 可用**。你能看到一条命令何时加入、在哪次提交。

### 模板测试分层

下方付费层的成本与速度估计早于当前模型默认值。
见[评测默认与覆盖](/contributing/#测试与评测)。

| 层 | 内容 | 成本 | 速度 |
|------|------|------|-------|
| 1——静态校验 | 解析 SKILL.md 里的每条 `$B` 命令并对照注册表校验；钉住 Aside 契约句子与渲染包装器的选项映射 | 免费 | <2s |
| 2——经 `claude -p` 的 E2E | 拉起真实 Claude 会话，逐技能运行，检查错误 | ~$3.85 | ~20min |
| 3——LLM 评审 | 默认 `claude-fable-5-1` 按清晰/完整/可行动打分 | ~$0.15 | ~30s |

第 1 层每次 `bun run test` 都跑。第 2+3 层在 `EVALS=1` 之后。思路：免费抓住 95% 的问题，LLM 只用于判断题。

## 命令分发

命令按副作用分类：

- **READ**（text、html、links、console、cookies……）：无变更。可安全重试。返回页面状态。
- **WRITE**（goto、click、fill、press……）：变更页面状态。不幂等。
- **META**（snapshot、screenshot、tabs、chain……）：不好归入读/写的服务器级操作。

这不只是组织性的。服务器用它做分发：

```typescript
if (READ_COMMANDS.has(cmd))  → handleReadCommand(cmd, args, bm)
if (WRITE_COMMANDS.has(cmd)) → handleWriteCommand(cmd, args, bm)
if (META_COMMANDS.has(cmd))  → handleMetaCommand(cmd, args, bm, shutdown)
```

`help` 命令返回全部三组，agent 因此能自发现可用命令。

## 错误哲学

错误是给 AI agent 的，不是给人的。每条错误消息必须可行动：

- "Element not found" → "Element not found or not interactable. Run `snapshot -i` to see available elements."
- "Selector matched multiple elements" → "Selector matched multiple elements. Use @refs from `snapshot` instead."
- 超时 → "Navigation timed out after 30s. The page may be slow or the URL may be wrong."

Playwright 的原生错误经 `wrapError()` 改写：剥内部栈、加指引。agent 应当能读错误就知道下一步做什么，无需人工介入。

### 崩溃恢复

服务器不试图自愈。Chromium 崩溃（`browser.on('disconnected')`）时服务器立即退出。CLI 在下一条命令上发现服务器已死并自动重启。这比试图重连半死的浏览器进程更简单也更可靠。

## E2E 测试基础设施

### 会话运行器（`test/helpers/session-runner.ts`）

E2E 测试把 `claude -p` 作为完全独立的子进程拉起——不经 Agent SDK，它嵌不进 Claude Code 会话。运行器：

1. 把 prompt 写进临时文件（避开 shell 转义问题）
2. 拉起 `sh -c 'cat prompt | claude -p --output-format stream-json --verbose'`
3. 从 stdout 流式读 NDJSON 获实时进度
4. 与可配置超时赛跑
5. 把完整 NDJSON 转录解析成结构化结果

`parseNDJSON()` 是纯函数——无 I/O、无副作用——因此可独立测试。

### 可观测性数据流

```
  skill-e2e-*.test.ts
        │
        │ generates runId, passes testName + runId to each call
        │
  ┌─────┼──────────────────────────────┐
  │     │                              │
  │  runSkillTest()              evalCollector
  │  (session-runner.ts)         (eval-store.ts)
  │     │                              │
  │  per tool call:              per addTest():
  │  ┌──┼──────────┐              savePartial()
  │  │  │          │                   │
  │  ▼  ▼          ▼                   ▼
  │ [HB] [PL]    [NJ]          _partial-e2e.json
  │  │    │        │             (atomic overwrite)
  │  │    │        │
  │  ▼    ▼        ▼
  │ e2e-  prog-  {name}
  │ live  ress   .ndjson
  │ .json .log
  │
  │  on failure:
  │  {name}-failure.json
  │
  │  ALL files in ~/.gstack-dev/
  │  Run dir: e2e-runs/{runId}/
```

**所有权拆分**：session-runner 拥有心跳（当前测试状态），eval-store 拥有部分结果（已完成测试状态）。两个组件互不知晓——只经文件系统共享数据。分片运行经分离日志（`~/.gstack-dev/eval-runs/`）与各分片自己的评测目录报实时进度。

**一切非致命**：所有可观测性 I/O 都包 try/catch。写失败绝不让测试失败。测试本身是事实源；可观测性尽力而为。

**可机读诊断**：每个测试结果含 `exit_reason`（success、timeout、error_max_turns、error_api、exit_code_N）、`timeout_at_turn` 与 `last_tool_call`。这让这样的 jq 查询成为可能：
```bash
jq '.tests[] | select(.exit_reason == "timeout") | .last_tool_call' ~/.gstack/projects/<slug>/evals/_partial-e2e.json
```

### 评测持久化（`test/helpers/eval-store.ts`）

`EvalCollector` 累积测试结果并以两种方式写出：

1. **增量**：`savePartial()` 每个测试后写 `_partial-e2e.json`（原子：写 `.tmp`、`fs.renameSync`）。扛得住 kill。
2. **终局**：`finalize()` 写带时间戳的评测文件（如 `e2e-20260314-143022.json`）。部分文件从不清理——它与终局文件并存供观察。

`eval:compare` 对比两次评测运行。`eval:summary` 聚合 `~/.gstack/projects/<slug>/evals/`（旧回退 `~/.gstack-dev/evals/`）全部运行的统计。两者都感知分片（v1.63.0.0）：分片付费运行器（`scripts/test-paid-shards.ts`，经 `test:gate:sharded` / `test:periodic:sharded` 运行——`eval:bg:gate` / `eval:bg:periodic` 脚本现指向这些）通过 `GSTACK_EVAL_DIR` 环境变量（`EvalCollector` 构造器尊重它）给每个分片的收集器独立目录 `<evalDir>/shards/<slug>/`，`eval:list` / `eval:compare` / `eval:summary` 扫描一层 `shards/<slug>/` 子目录（`eval:flake-rank` 递归读同一棵树，外加免费套件 flake 台账）。基线查找排除 `_partial` 累加器（`eval-store.ts` 的 `isPartialEval` / `findLatestFinalizedRun`），所以自动对比绝不用当前运行自己的部分文件当基线。

### 测试分层

下方付费层的成本与速度估计早于当前模型默认值。
见[评测默认与覆盖](/contributing/#测试与评测)。

| 层 | 内容 | 成本 | 速度 |
|------|------|------|-------|
| 1——静态校验 | 对照注册表解析 `$B` 命令、Aside 契约钉、渲染包装器钉、可观测性单测 | 免费 | <5s |
| 2——经 `claude -p` 的 E2E | 拉起真实 Claude 会话，逐技能运行，扫错误 | ~$3.85 | ~20min |
| 3——LLM 评审 | 默认 `claude-fable-5-1` 按清晰/完整/可行动打分 | ~$0.15 | ~30s |

第 1 层每次 `bun run test` 都跑。第 2+3 层在 `EVALS=1` 之后。思路：免费抓住 95% 的问题，LLM 只用于判断题与集成测试。

需要 Aside 本体的——`test/skill-e2e-aside.test.ts`、qa 与 design-review E2E 文件里的 Aside 用例、`test/aside-render.test.ts` 的实机往返——只在开着 Aside 应用的 Mac 上跑、别处自跳过（`test/helpers/aside-available.ts` 的 `asideAvailable()`；`GSTACK_SKIP_ASIDE=1` 强制跳过）。渲染门与引擎无关：make-pdf 的 `*-gate.test.ts` 与 `test/skill-e2e-diagram.test.ts` 走解析出的任一引擎（`test/helpers/browser-available.ts` 的 `browserAvailable()` = `asideAvailable() || resolveBrowseBin() !== null`），只在两者皆无时跳过，所以 Linux CI 用 `bun run build:gates` 构建 browse 二进制并实跑它们。回退引擎自己的测试（`browse/test/`、`$B` 驱动的 E2E 用例）照旧在所有平台跑：Linux CI 实证回退路径、静态校验 Aside 契约。

## 刻意不做的

- **`aside repl` 调用之间无持久页面**。每个 Aside 脚本都是全新会话，标签页随之消亡。每脚本重新导航是该模型诚实的税；`aside mcp` 以后可能免掉它（TODOS.md）。
- **没有自己的搜索工具**。调研先 Aside、再宿主的 WebSearch 工具、再分布内知识——每次降级都说出口。
- **没有 WebSocket 流**。HTTP 请求/响应更简单、curl 可调试、也够快。流式为边际收益加复杂度。
- **没有 MCP 协议**。MCP 每请求加 JSON schema 开销并要求持久连接。纯 HTTP + 纯文本输出更省 token、更好调试。
- **没有多用户支持**。每工作区一个服务器、一个用户。令牌认证是纵深防御，不是多租户。
- **没有万能会话恢复**。OS 级 cookie 导入支持 macOS、Linux 与 DPAPI 兼容的 Windows 格式，不是每种加密方案或站点认证状态。Windows 原生提取资格核实前保持禁用，Chrome 的受保护默认目录不被绕过。
- **没有 iframe 自动发现**。`$B frame` 支持跨 frame 交互（CSS 选择器、@ref、`--name`、`--url` 匹配），但 ref 系统不在 `snapshot` 期间自动爬 iframe。你必须先显式进入某个 frame 上下文。
