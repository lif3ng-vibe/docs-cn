# Ollama 文档汉化术语表

源站：https://docs.ollama.com （Mintlify，ollama/ollama@c1db5f9 docs/）
本表是所有翻译子代理的统一规范 + 终检 grep 清单。

## 术语对照

| 英文 | 中文 | 备注 |
|---|---|---|
| model | 模型 | |
| cloud model | 云端模型 | |
| local model | 本地模型 | |
| API key | API 密钥 | 全站统一「API 密钥」，不再附原词 |
| coding agent | 编码代理 | |
| agent | 代理 | |
| desktop app | 桌面应用 | |
| app (Ollama App) | 应用 | 「Ollama 应用」 |
| integration | 集成 | |
| context length | 上下文长度 | |
| context window | 上下文窗口 | |
| structured outputs | 结构化输出 | |
| tool calling | 工具调用 | |
| streaming | 流式（输出） | 「流式响应」「流式输出」按语境 |
| embeddings | 嵌入 | |
| thinking | 思考 | 能力名（Thinking） |
| reasoning | 推理 | |
| vision | 视觉 | |
| web search | 网页搜索 | |
| speech | 语音 | |
| inference | 推理 | GPU 语境「本地推理」 |
| prompt | 提示词 | |
| pull | 拉取 | 模型操作 |
| push | 推送 | 模型操作 |
| quantization / quantize | 量化 | |
| rate limit | 速率限制 | |
| endpoint | 端点 | |
| library | 库 | 软件库；model library = 模型库 |
| sign in | 登录 | |
| hardware | 硬件 | |
| sandboxing | 沙箱 | |
| assistant | 助手 | |
| notebook | 笔记本 | marimo 语境 |
| workspace | 工作区 | |
| plugin | 插件 | |
| setup | 安装 | 引导流程语境「设置」 |
| download | 下载 | |
| install | 安装 | |
| parameter | 参数 | 模型规模参数（7b/13b）保留原样如 `7b` |
| multimodal | 多模态 | |
| base URL | 基础 URL | |
| request / response | 请求 / 响应 | |
| message | 消息 | |
| request header | 请求头 | |
| digest | 摘要 | openapi blob 校验值语境 |
| manifest | 清单 | |
| blob | blob | 不译 |
| layer | 层 | 模型层 |
| template | 模板 | |
| system prompt | 系统提示词 | |
| keep-alive | keep-alive | 不译（参数名） |
| format (json) | 格式 | |
| image (multimodal input) | 图片 | |
| GPU / VRAM | GPU / 显存 | |
| CPU | CPU | 不译 |

## 不译名单

产品/工具名：Ollama、Modelfile、Mintlify、Claude、Claude Code、Claude Desktop、ChatGPT、Codex、OpenCode、Cline、Roo Code、Goose、Zed、JetBrains、VS Code、Xcode、n8n、marimo、Onyx、Droid、Hermes、OpenClaw、Nemoclaw、Pi、DeepSeek、GitHub Copilot、Discord、Reddit、Docker、WSL、systemd、llama.cpp、GGUF、Hugging Face、OpenAI、Anthropic、Python、JavaScript、Node.js、curl、Pagefind

技术名：API、CLI、SDK、REST、HTTP、JSON、YAML、TLS、SSO、GPU、VRAM、CPU、RAM、SSD、CUDA、ROCm、Metal、MPS、AVX、RAG（首次可写「检索增强生成（RAG）」）、OpenAPI、MCP、SSE、token（术语语境）、ollama（命令/库名）

代码要素：代码块、命令、子命令、环境变量（`OLLAMA_*`）、配置键、API 路径（`/api/chat`）、错误消息原文、curl 参数、HTTP 方法、状态码、模型名（gemma4:31b 等）、`#` 外的代码注释（**代码块围栏标注的语言名与 `#` 注释要译**：```shell 后的标题如 "Claude Code" 是 tab 名要译）

## 排版规范

- 中文全角标点（，。：；？！、），引号用 ""，破折号——不带空格
- 中英文/数字之间一个半角空格；代码内保持半角
- **粗体 CJK 闭合**：句读/括注移出粗体——`**……。**后文` ✗ → `**……**。后文` ✓；`**词（gloss）**` ✗ → `**词**（gloss）` ✓
- 术语首次出现附英文原词：知识图谱（knowledge graph）式；仅正文首次，高频词（API 密钥、端点等）直接用中文

## 锚点规则（重要）

- **子代理不改页内 `#锚点` 链接**，保持英文原样；每文件输出映射文件 `.anchor-maps/<batch>/<file>.map.md`，行格式：`原英文标题 | 中文标题 | 新锚点`
- 新锚点 = Mintlify slug 规则：小写 → 空格转 `-`，CJK 保留，非字母数字段转一个 `-`（原有 `-` 保留，连续合并）。例：`Get started` → `get-started`；`What's new` → `whats-new`；`1. Create an API key` → `1-create-an-api-key`；`API 密钥` → `api-密钥`；`创建 API 密钥` → `创建-api-密钥`
- 页面标题（frontmatter title）译文要与侧边栏一致；H1 不写（frontmatter 提供）
- frontmatter 字符串值必须加双引号（Mintlify 解析器中文裸标量会挂）

## 翻译范围速查

**译**：frontmatter title/description/sidebarTitle；正文；表格表头与说明列；Mintlify 组件可见 props（Card title/icon 外的字符串、Tabs tab 名、Accordion title、Step title 等）；JSX 子内容；codeGroup 围栏标注里的 tab 标题；`:::tip/note/warning` 标题与正文；页内链接文字（路径不动）。

**不译**：代码块内容、命令、环境变量、API 路径、模型名、报错原文、href/src/icon/颜色值等属性、openapi 的参数名/枚举值/schema 字段名。

**openapi.yaml 专属**：译 `summary`、`description`、Markdown 描述文本；不译 `operationId`、参数名、schema 字段名、枚举值、example 的 key（example 字符串值若为人类可读说明可译，请求/响应样例值不译）。
