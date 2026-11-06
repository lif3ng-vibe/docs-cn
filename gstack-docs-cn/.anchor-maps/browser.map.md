## Aside is the browser gstack drives first | ## Aside 是 gstack 优先驱动的浏览器
### The driver contract | ### 驱动契约
### What each skill does in Aside | ### 各技能在 Aside 中做什么
### Local-HTML rendering | ### 本地 HTML 渲染
### Cookbook | ### 范例集（cookbook）
### Web research runs in Aside first | ### 网络调研也先走 Aside
## When the fallback kicks in | ## 回退何时启用
## The fallback engine — complete reference | ## 回退引擎——完整参考
## Quick start | ## 快速开始
# One-time: build the binary (browse/dist/browse, ~58MB) | # 一次性操作：构建二进制（browse/dist/browse，约 58MB）
# Set $B once and forget about it | # 设置一次 $B，之后不用再管
# Drive a page | # 驱动一个页面
# Codify a repeated flow | # 把重复流程固化下来
# Watch Claude work in real time | # 实时观看 Claude 工作
## Table of contents | ## 目录
## What it is | ## 它是什么
## The productivity loop | ## 效率循环
### `/scrape <intent>` | ### `/scrape <intent>`
### `/skillify` | ### `/skillify`
## Architecture | ## 架构
### Daemon lifecycle | ### 守护进程生命周期
### Multi-workspace isolation | ### 多工作区隔离
## Command reference | ## 命令参考
### Reading | ### 读取
### Inspection | ### 检查
### Navigation | ### 导航
### Interaction | ### 交互
### Style + cleanup | ### 样式与清理
### Visual | ### 视觉
### Cookies + headers | ### Cookie 与请求头
#### Choosing a source and checking sign-in | #### 选择来源浏览器并确认登录
### Tabs + frames | ### 标签页与框架
### Phone emulation + touch | ### 手机模拟与触控
### Extraction | ### 提取
### Snapshot | ### 快照
### Server lifecycle | ### 服务端生命周期
### Handoff | ### 交接（handoff）
### Meta + chains | ### 元命令与命令链
### Browser-skills runtime | ### 浏览器技能运行时
### Domain-skills | ### 站点技能
## Snapshot system | ## 快照系统
### How `@ref` works | ### `@ref` 如何工作
### Ref staleness detection | ### ref 失效检测
### Extended snapshot features | ### 扩展快照功能
## Browser-skills runtime | ## 浏览器技能运行时
### Anatomy of a browser-skill | ### 浏览器技能的构成
### Three-tier storage | ### 三层存储
### Trust model | ### 信任模型
### Output protocol | ### 输出协议
### How the SDK distribution works | ### SDK 分发如何运作
### Atomic write discipline (`/skillify` D3) | ### 原子写入纪律（`/skillify` D3）
## Domain-skills | ## 站点技能
## Real-browser mode | ## 真实浏览器模式
### What "GStack Browser" means | ### "GStack Browser" 意味着什么
### When to use headed mode | ### 何时使用有头模式
### Aside and third-party drives (v1.72.0.0+) | ### Aside 与第三方驱动（v1.72.0.0+）
### CDP-aware skills | ### CDP 感知技能
### Headed mode + proxy + browser-native downloads (v1.28.0.0) | ### 有头模式、代理与浏览器原生下载（v1.28.0.0）
# Visible Chromium. Auto-spawns Xvfb on Linux containers without DISPLAY. | # 可见的 Chromium。在没有 DISPLAY 的 Linux 容器上自动拉起 Xvfb。
# SOCKS5 with auth — Chromium can't prompt for SOCKS5 creds, so $B runs a | # 带认证的 SOCKS5——Chromium 弹不了 SOCKS5 凭据提示，所以 $B 会跑一个
# local 127.0.0.1 bridge that handles the auth handshake. | # 处理认证握手的本地 127.0.0.1 桥。
# HTTP/HTTPS proxy passes through to Chromium directly. | # HTTP/HTTPS 代理直接透传给 Chromium。
# Browser-native download for Content-Disposition, redirect chains, anti-bot | # 浏览器原生下载，用于 Content-Disposition、重定向链、page.request.fetch()
# CDNs where page.request.fetch() falls over. | # 会趴窝的反爬 CDN 场景。
# Combined. | # 组合使用。
### Proxy from environment | ### 从环境变量读取代理
## Side Panel + sidebar agent | ## Side Panel 与侧边栏 agent
### The Terminal pane (the headline) | ### 终端面板（招牌功能）
### Activity feed | ### 活动流
### Refs tab | ### Refs 标签页
### CSS Inspector | ### CSS 检查器
### Sidebar architecture | ### 侧边栏架构
### Manual install (for your regular Chrome) | ### 手动安装（用于你的日常 Chrome）
## Pair-agent | ## Pair-agent
### How it works | ### 工作原理
# Copy the instructions to the remote agent | # 把说明复制给远程 agent
# Remote agent runs: | # 远程 agent 执行：
#   POST <tunnel-url>/connect with setup key → gets a scoped token (24h, single client) | #   POST <tunnel-url>/connect 携带设置密钥 → 获得作用域令牌（24 小时，单客户端）
#   POST <tunnel-url>/command with token → runs allowed commands | #   POST <tunnel-url>/command 携带令牌 → 运行允许的命令
### Dual-listener architecture (v1.6.0.0+) | ### 双监听器架构（v1.6.0.0+）
### The 26-command tunnel allowlist | ### 隧道 26 命令白名单
### Tunnel denial log | ### 隧道拒绝日志
### Tunnel egress receipts (v1.63+) | ### 隧道出站回执（v1.63+）
### Tab ownership | ### 标签页所有权
## Authentication | ## 认证与令牌
### SSE session cookie (v1.6.0.0+) | ### SSE 会话 cookie（v1.6.0.0+）
### PTY session cookie | ### PTY 会话 cookie
### Extension token bootstrap (v1.63+) | ### 扩展令牌自举（v1.63+）
### Token registry | ### 令牌注册表
## Security stack | ## 安全栈
### Thresholds | ### 阈值
### Ensemble rule | ### 集成规则
### Env knobs | ### 环境变量开关
### TLS trust: the bundled Chromium's root store | ### TLS 信任：内置 Chromium 的根证书库
## Screenshots, PDFs, visual | ## 截图、PDF 与视觉检查
### Screenshot modes | ### 截图模式
### Retina screenshots — `viewport --scale` | ### Retina 截图——`viewport --scale`
# .card at 400x200 CSS pixels → card.png is 800x400 pixels | # .card 为 400x200 CSS 像素 → card.png 是 800x400 像素
### PDF generation | ### PDF 生成
### Responsive screenshots | ### 响应式截图
### `prettyscreenshot` | ### `prettyscreenshot`
## Local HTML | ## 本地 HTML
## Batch endpoint | ## 批量端点
## Capture | ## 捕获
## JS execution | ## JS 执行
## Tabs, frames, state | ## 标签页、框架与状态
### Tabs | ### 标签页
### Frames | ### 框架
### State save/load | ### 状态保存/加载
### Watch | ### Watch
### Inbox | ### Inbox
## CDP | ## CDP
### `$B cdp` — raw Chrome DevTools Protocol dispatch | ### `$B cdp`——原生 Chrome DevTools Protocol 分发
# Perf measurement on a simulated low-end client (overrides persist on the | # 在模拟低端客户端上做性能测量（覆盖项会保留在标签页上，直到你清除——
# tab until you clear them — callers own restoration): | # 恢复由调用方负责）：
# clear: '{"offline":false,"latency":0,"downloadThroughput":-1,"uploadThroughput":-1}' | # 清除：'{"offline":false,"latency":0,"downloadThroughput":-1,"uploadThroughput":-1}'
### `$B inspect` — CDP-based CSS inspector | ### `$B inspect`——基于 CDP 的 CSS 检查器
### `$B ux-audit` | ### `$B ux-audit`
## Performance | ## 性能
### Why CLI over MCP | ### 为什么选 CLI 而不是 MCP
## Multi-workspace | ## 多工作区
## Environment variables | ## 环境变量
## Source map | ## 源码地图
## QA surfaces and setup | ## QA 覆盖面与安装
## Development | ## 开发
### Prerequisites | ### 前置要求
### Quick start | ### 快速开始
### Dev mode vs compiled binary | ### 开发模式与编译二进制
### Running tests | ### 运行测试
### Adding a new command | ### 新增一个命令
### Adding a new browser-skill | ### 新增一个浏览器技能
### Deploying to the active skill | ### 部署到活动技能
## Cross-references | ## 交叉引用
## Acknowledgments | ## 致谢
